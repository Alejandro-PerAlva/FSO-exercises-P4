const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, usersInDb, initialUsers, blogsInDb } = require('./test_helper')
const api = supertest(app)
const bcrypt = require('bcrypt')
const { test, after, beforeEach, describe } = require('node:test')

describe('POST /api/blogs', () => {
  beforeEach(async () => {
    const users = await initialUsers()
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
    await User.deleteMany({})
    await User.insertMany(users)
})

test('a valid blog can be added', async () => {
    const userCredentials = {
        username: 'root',
        password: 'hashed_password_1'
    }

    const loginResponse = await api
        .post('/api/login')
        .send(userCredentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const token = `Bearer ${loginResponse.body.token}`

    const newBlog = {
        title: "New Blog Post",
        author: "root",
        url: "http://example.com/",
        likes: 2,
        user: loginResponse.body.user._id
    }

    await api
        .post('/api/blogs')
        .set('Authorization', token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(titles.includes('New Blog Post'))
})

  test('if the likes property is missing, it defaults to 0', async () => {
    const userCredentials = {
      username: 'root',
      password: 'hashed_password_1'
  }

  const loginResponse = await api
      .post('/api/login')
      .send(userCredentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  const token = `Bearer ${loginResponse.body.token}`

  const newBlog = {
      title: "Blog without likes",
      author: "root",
      url: "http://example.com/",
      user: loginResponse.body.user._id
  }

  await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()
    const addedBlog = blogsAtEnd.find(blog => blog.title === "Blog without likes")
    assert.strictEqual(addedBlog.likes, 0)
  })

  test('missing title or url responds with status 400', async () => {
    const userCredentials = {
      username: 'root',
      password: 'hashed_password_1'
  }

  const loginResponse = await api
      .post('/api/login')
      .send(userCredentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  const token = `Bearer ${loginResponse.body.token}`

  const newBlog = {
      title: "Blog without url",
      author: "root",
      likes: 2,
      user: loginResponse.body.user._id
  }

  await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    const userCredentials = {
      username: 'root',
      password: 'hashed_password_1'
  }

  const loginResponse = await api
      .post('/api/login')
      .send(userCredentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  const token = `Bearer ${loginResponse.body.token}`

    await api
      .get('/api/blogs')
      .set('Authorization', token)
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

    const userCredentials = {
      username: 'root',
      password: 'hashed_password_1'
  }

  const loginResponse = await api
      .post('/api/login')
      .send(userCredentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  const token = `Bearer ${loginResponse.body.token}`

  const newBlog = {
    title: "New Blog Post",
    author: "root",
    url: "http://example.com/",
    likes: 2,
    user: loginResponse.body.user._id
}

  const result = await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    await api
      .delete(`/api/blogs/${result.body.id}`)
      .set('Authorization', token)
      .expect(204)

    const blogsAfterDelete = await blogsInDb()

    assert.strictEqual(blogsAfterDelete.length, initialBlogs.length)

    const titles = blogsAfterDelete.map(r => r.title)
    assert(!titles.includes(result.body.title))
  })
})

describe('PUT /api/blogs/:id', () => {
    test('a blog\'s likes can be updated', async () => {
      const userCredentials = {
        username: 'root',
        password: 'hashed_password_1'
    }

    const loginResponse = await api
        .post('/api/login')
        .send(userCredentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const token = `Bearer ${loginResponse.body.token}`

    const newBlog = {
      title: "New Blog Post",
      author: "root",
      url: "http://example.com/",
      likes: 2,
      user: loginResponse.body.user._id
  }

    const result = await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

      const updatedLikes = { likes: 10 }

      await api
        .put(`/api/blogs/${result.body.id}`)
        .set('Authorization', token)
        .send(updatedLikes)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await blogsInDb()
      const updatedBlog = blogsAtEnd.find(blog => blog.id === result.body.id)

      assert.strictEqual(updatedBlog.likes, 10)
    })
  })

  describe('Login functionality', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
    })

    test('login succeeds with correct credentials', async () => {
      const userCredentials = {
        username: 'root',
        password: 'sekret'
      }

      const result = await api
        .post('/api/login')
        .send(userCredentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert(result.body.token)
    })

    test('login fails with wrong credentials', async () => {
      const userCredentials = {
        username: 'root',
        password: 'wrongpassword'
      }

      const result = await api
        .post('/api/login')
        .send(userCredentials)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('invalid username or password'))
    })

    test('login fails if username is missing', async () => {
      const result = await api
          .post('/api/login')
          .send({ password: 'salainen' })
          .expect(400)
          .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('Username is required'))
  })

  test('login fails if password is missing', async () => {
      const result = await api
          .post('/api/login')
          .send({ username: 'mluukkai' })
          .expect(400)
          .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('Password is required'))
  })

  })

  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        const users = await initialUsers()
        await User.deleteMany({})
        await User.insertMany(users)
      })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with status 400 if username is less than 3 characters', async () => {
    const newUser = {
      username: 'ml',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    const users = await initialUsers()
    assert.strictEqual(usersAtEnd.length, users.length)
  })

  test('creation fails with status 400 if username is missing', async () => {
    const newUser = {
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    const users = await initialUsers()
    assert.strictEqual(usersAtEnd.length, users.length)
  })

  test('creation fails with status 400 if password is missing or too short', async () => {
    const newUser = {
      username: 'validuser',
      name: 'Valid User',
      password: 'pw'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    const users = await initialUsers()
    assert.strictEqual(usersAtEnd.length, users.length)
  })
})


after(async () => {
  await mongoose.connection.close()
})
