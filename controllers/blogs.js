const express = require('express')
const Blog = require('../models/blog')
const blogsRouter = express.Router()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', { username: 1, name: 1 })
  response.json(blog)
})


blogsRouter.post('/', async (request, response) => {
  const user = request.user

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.post('/:id/comments', async (req, res) => {
  const { id } = req.params
  const { comment } = req.body

  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' })
  }

  const blog = await Blog.findById(id)
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' })
  }

  blog.comments = blog.comments || []
  blog.comments.push(comment)

  const updatedBlog = await blog.save()
  res.status(200).json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'unauthorized user' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true, runValidators: true }
  ).populate('user', { name: 1 })
  response.json(updatedBlog)
})

module.exports = blogsRouter
