const express = require('express')
const Blog = require('../models/blog')
const blogsRouter = express.Router()


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})


blogsRouter.post('/', async (req, res) => {
  const { title, url, author } = req.body

  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: req.body.likes || 0,
  })

  const savedBlog = await blog.save()
  res.status(201).json(savedBlog)
})

module.exports = blogsRouter
