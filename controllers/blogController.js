import { validationResult } from "express-validator"
import { v2 as cloudinary } from "cloudinary"
import Blog from "../models/Blog.js"

// Helper function for Cloudinary upload
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: folder,
        timeout: 60000, // 60 seconds timeout
        transformation: [
          { width: 1000, height: 1000, crop: "limit" }, // Limit size to reduce upload time
          { quality: "auto" }, // Auto optimize quality
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error)
          reject(error)
        } else {
          resolve(result)
        }
      },
    )
    stream.end(fileBuffer)
  })
}

// Create blog
export const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "Blog image is required" })
    }

    try {
      // Upload image to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer, "blog_images")

      // Create blog
      const blog = new Blog({
        title,
        description,
        image: uploadResult.secure_url,
        author: req.user._id,
      })

      await blog.save()
      await blog.populate("author", "email")

      res.status(201).json({
        message: "Blog created successfully",
        blog,
      })
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError)
      return res.status(500).json({ message: "Image upload failed. Please try again." })
    }
  } catch (error) {
    console.error("Create blog error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "email").sort({ createdAt: -1 })
    res.json(blogs)
  } catch (error) {
    console.error("Get blogs error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get single blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "email")

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    res.json(blog)
  } catch (error) {
    console.error("Get blog error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description } = req.body
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    // Check if user owns the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    let imageUrl = blog.image

    // If new image is uploaded
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, "blog_images")
        imageUrl = uploadResult.secure_url
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError)
        return res.status(500).json({ message: "Image upload failed. Please try again." })
      }
    }

    blog.title = title
    blog.description = description
    blog.image = imageUrl

    await blog.save()
    await blog.populate("author", "email")

    res.json({
      message: "Blog updated successfully",
      blog,
    })
  } catch (error) {
    console.error("Update blog error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    // Check if user owns the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await Blog.findByIdAndDelete(req.params.id)

    res.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Delete blog error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get user's blogs
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).populate("author", "email").sort({ createdAt: -1 })
    res.json(blogs)
  } catch (error) {
    console.error("Get user blogs error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
