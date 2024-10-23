const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

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

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.status, 200)
    assert.match(response.headers['content-type'], /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    blogs.forEach(blog => {
      assert(blog.id, 'Each blog should have an id property')
      assert.strictEqual(blog._id, undefined, 'The property _id should not exist')
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
