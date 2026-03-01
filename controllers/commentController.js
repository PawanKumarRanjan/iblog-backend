import Comment from "../models/Comment.js"

// Create a new comment on a blog
export const createComment = async (req, res) => {
  try {
    const { text } = req.body
    const { blogId } = req.params
    const userId = req.user.id

    if (!text || text.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Comment text cannot be empty" })
    }

    if (text.length > 5000) {
      return res
        .status(400)
        .json({ message: "Comment text cannot exceed 5000 characters" })
    }

    const newComment = new Comment({
      text,
      author: userId,
      blog: blogId,
      replies: [],
    })

    await newComment.save()
    await newComment.populate("author", "email profileImage")

    res.status(201).json(newComment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all comments for a blog
export const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params

    const comments = await Comment.find({ blog: blogId })
      .populate("author", "email profileImage")
      .populate({
        path: "replies.author",
        select: "email profileImage",
      })
      .sort({ createdAt: -1 })

    res.status(200).json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add a reply to a comment
export const addReply = async (req, res) => {
  try {
    const { text } = req.body
    const { commentId } = req.params
    const userId = req.user.id

    if (!text || text.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Reply text cannot be empty" })
    }

    if (text.length > 5000) {
      return res
        .status(400)
        .json({ message: "Reply text cannot exceed 5000 characters" })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    const reply = {
      text,
      author: userId,
      replies: [],
    }

    comment.replies.push(reply)
    await comment.save()
    await comment.populate("author", "email profileImage")
    await comment.populate({
      path: "replies.author",
      select: "email profileImage",
    })

    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a comment (only by author)
export const updateComment = async (req, res) => {
  try {
    const { text } = req.body
    const { commentId } = req.params
    const userId = req.user.id

    if (!text || text.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Comment text cannot be empty" })
    }

    if (text.length > 5000) {
      return res
        .status(400)
        .json({ message: "Comment text cannot exceed 5000 characters" })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" })
    }

    comment.text = text
    await comment.save()
    await comment.populate("author", "email profileImage")
    await comment.populate({
      path: "replies.author",
      select: "email profileImage",
    })

    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a comment (only by author)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const userId = req.user.id

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" })
    }

    await Comment.findByIdAndDelete(commentId)

    res.status(200).json({ message: "Comment deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a reply (only by author)
export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyIndex } = req.params
    const userId = req.user.id

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    const reply = comment.replies[replyIndex]

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" })
    }

    if (reply.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own replies" })
    }

    comment.replies.splice(replyIndex, 1)
    await comment.save()
    await comment.populate("author", "email profileImage")
    await comment.populate({
      path: "replies.author",
      select: "email profileImage",
    })

    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
