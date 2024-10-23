const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
const { test, after, beforeEach, describe } = require('node:test')

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
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

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    const titles = response.body.map(r => r.title)
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

    const response = await api.get('/api/blogs')
    const addedBlog = response.body.find(blog => blog.title === "Blog without likes")
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
    const response = await api.get('/api/blogs')
    const blogs = response.body
    blogs.forEach(blog => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
