const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: 'Understanding JavaScript Closures',
    author: 'Jane Doe',
    url: 'http://example.com/understanding-js-closures',
    likes: 15,
    user: '60d5ec49f60f3a35c79d5876'
  },
  {
    title: 'The Rise of React',
    author: 'John Smith',
    url: 'http://example.com/rise-of-react',
    likes: 25,
    user: '60d5ec49f60f3a35c79d5877'
  },
  {
    title: 'Node.js for Beginners',
    author: 'Alice Johnson',
    url: 'http://example.com/nodejs-beginners',
    likes: 30,
    user: '60d5ec49f60f3a35c79d5876'
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const initialUsers = async () => {
const pw1 = await bcrypt.hash('hashed_password_1', 10)
const pw2 = await bcrypt.hash('hashed_password_2', 10)
const pw3 = await bcrypt.hash('hashed_password_3', 10)

return [
  {
    username: 'root',
    name: 'Root User',
    passwordHash: pw1,
    blogs: []
  },
  {
    username: 'jane_doe',
    name: 'Jane Doe',
    passwordHash: pw2,
    blogs: []
  },
  {
    username: 'john_smith',
    name: 'John Smith',
    passwordHash: pw3,
    blogs: []
  }
]
}

module.exports = {
  initialBlogs,
  initialUsers,
  blogsInDb,
  usersInDb
}
