// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return null
    }

    return blogs.reduce((prev, current) => {
      return (prev.likes > current.likes) ? prev : current
    })
  }

const lodash = require('lodash')

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
      return null
    }

    const authorCount = lodash.countBy(blogs, 'author')

    // eslint-disable-next-line no-unused-vars
    const mostBlogsAuthor = lodash.maxBy(Object.entries(authorCount), ([author, count]) => count)

    return {
      author: mostBlogsAuthor[0],
      blogs: mostBlogsAuthor[1]
    }
  }

  const mostLikes = (blogs) => {
    if (blogs.length === 0) {
      return null
    }

    const authorLikes = lodash.reduce(blogs, (acc, blog) => {
      acc[blog.author] = (acc[blog.author] || 0) + blog.likes
      return acc
    }, {})

    const mostLikedAuthor = lodash.maxBy(lodash.keys(authorLikes), (author) => authorLikes[author])

    return {
      author: mostLikedAuthor,
      likes: authorLikes[mostLikedAuthor]
    }
  }

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }