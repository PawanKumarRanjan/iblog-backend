import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import authRoutes from "./routes/auth.js"
import blogRoutes from "./routes/blogs.js"
import multer from "multer"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT

// Connect to database and cloudinary
connectDB()
connectCloudinary()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/blogs", blogRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large" })
    }
  }
  res.status(500).json({ message: error.message })
})

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Blog API is running!" })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
