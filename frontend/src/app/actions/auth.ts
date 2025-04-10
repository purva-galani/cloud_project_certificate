"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { toast } from "sonner"

export async function authenticate(formData: FormData) {
  try {
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      toast.error("Username and password are required")
      return { error: "Username and password are required" }
    }

    const user = await db.select().from(users).where(eq(users.username, username)).get()

    if (!user) {
      toast.error("Invalid credentials")
      return { error: "Invalid credentials" }
    }

    // In production, use proper password comparison (e.g., bcrypt)
    if (user.password !== password) {
      toast.error("Invalid credentials")
      return { error: "Invalid credentials" }
    }

    toast.success("Authentication successful")
    return { success: true }
  } catch (error) {
    toast.error("An error occurred during authentication")
    return { error: "An error occurred during authentication" }
  }
}