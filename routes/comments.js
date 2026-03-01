import express from "express"
import auth from "../middleware/auth.js"
import {
  createComment,
  getCommentsByBlog,
  addReply,
  updateComment,
  deleteComment,
  deleteReply,
} from "../controllers/commentController.js"

const router = express.Router()

// Get all comments for a blog (public route)
router.get("/:blogId", getCommentsByBlog)

// Create a comment on a blog (auth required)
router.post("/:blogId", auth, createComment)

// Update a comment (auth required)
router.put("/:commentId", auth, updateComment)

// Delete a comment (auth required)
router.delete("/:commentId", auth, deleteComment)

// Add a reply to a comment (auth required)
router.post("/:commentId/replies", auth, addReply)

// Delete a reply (auth required)
router.delete("/:commentId/replies/:replyIndex", auth, deleteReply)

export default router
