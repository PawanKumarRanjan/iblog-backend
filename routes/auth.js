import express from "express"
import { body } from "express-validator"
import { register, login, getProfile } from "../controllers/authController.js"
import auth from "../middleware/auth.js"
import upload from "../middleware/upload.js"

const router = express.Router()

// Register route
router.post(
  "/register",
  upload.single("profileImage"),
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  register,
)

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login,
)

// Get profile route
router.get("/profile", auth, getProfile)

export default router
