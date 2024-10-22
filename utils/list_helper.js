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

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }