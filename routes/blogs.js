import express from "express"
import { body } from "express-validator"
import { createBlog, getBlogs, getBlog, updateBlog, deleteBlog, getUserBlogs } from "../controllers/blogController.js"
import auth from "../middleware/auth.js"
import upload from "../middleware/upload.js"

const router = express.Router()

// Create blog
router.post(
  "/",
  auth,
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  createBlog,
)

// Get all blogs
router.get("/", getBlogs)

// Get user's blogs
router.get("/my-blogs", auth, getUserBlogs)

// Get single blog
router.get("/:id", getBlog)

// Update blog
router.put(
  "/:id",
  auth,
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  updateBlog,
)

// Delete blog
router.delete("/:id", auth, deleteBlog)

export default router
