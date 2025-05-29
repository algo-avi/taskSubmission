const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: "admin@example.com" })

    if (existingUser) {
      console.log("Admin user already exists")
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)

    const adminUser = new User({
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    })

    await adminUser.save()
    console.log("Admin user created successfully")
    console.log("Email: admin@example.com")
    console.log("Password: admin123")
  } catch (error) {
    console.error("Seeding error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seedDatabase()
