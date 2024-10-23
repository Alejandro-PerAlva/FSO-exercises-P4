const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb } = require('./test_helper')
const api = supertest(app)
const { test, after, beforeEach, describe } = require('node:test')

beforeEach(async () => {
  await Blog.deleteMany({})
  for (const blog of initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('POST /api/blogs', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: "New Blog Post",
      author: "John Doe",
      url: "http://example.com/",
      likes: 2
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb() // Usamos la función para obtener los blogs
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)
    const titles = blogsAtEnd.map(r => r.title)
    assert(titles.includes('New Blog Post'))
  })

  test('if the likes property is missing, it defaults to 0', async () => {
    const newBlogWithoutLikes = {
      title: "Blog without likes",
      author: "Jane Doe",
      url: "http://example.com/blog-without-likes"
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()
    const addedBlog = blogsAtEnd.find(blog => blog.title === "Blog without likes")
    assert.strictEqual(addedBlog.likes, 0)
  })

  test('missing title or url responds with status 400', async () => {
    const newBlogWithoutTitle = {
      author: "Jane Doe",
      url: "http://example.com/blog-without-title"
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutTitle)
      .expect(400)

    const newBlogWithoutUrl = {
      title: "Blog without URL",
      author: "Jane Doe"
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutUrl)
      .expect(400)
  })
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
})

describe('unique identifier property is id', () => {
  test('verifies that the unique identifier is named id', async () => {
    const blogsAtStart = await blogsInDb()
    blogsAtStart.forEach(blog => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0]
    console.log(blogToDelete.id)
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAfterDelete = await blogsInDb()

    assert.strictEqual(blogsAfterDelete.length, initialBlogs.length - 1)

    const titles = blogsAfterDelete.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  })
})

after(async () => {
  await mongoose.connection.close()
})
