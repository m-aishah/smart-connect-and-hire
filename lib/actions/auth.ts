"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = "7d";

export type UserSession = {
  id: string;
  name: string;
  email: string;
  userType: "provider" | "seeker";
  image?: string;
};

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & UserSession;
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      userType: decoded.userType,
      image: decoded.image,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  userType: "provider" | "seeker"
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    const existingUser = await client.fetch(
      `*[_type == "author" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return {
        success: false,
        message: "Email already registered",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await writeClient.create({
      _type: "author",
      name,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date().toISOString(),
    });

    if (!result._id) {
      return {
        success: false,
        message: "Failed to create user",
      };
    }

    return {
      success: true,
      message: "User created successfully",
      userId: result._id,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "An error occurred during sign up",
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await client.fetch(
      `*[_type == "author" && email == $email][0]{
        _id,
        name,
        email,
        password,
        userType,
        image
      }`,
      { email }
    );

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        image: user.image,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    (await
          cookies()).set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Error during sign in:", error);
    return {
      success: false,
      message: "An error occurred during sign in",
    };
  }
}

export async function signOut() {
  (await cookies()).delete("authToken");
  redirect("/");
}

export async function authMiddleware() {
  const session = await getSession();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return session;
}

export async function providerMiddleware() {
  const session = await getSession();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  if (session.userType !== "provider") {
    redirect("/");
  }
  
  return session;
}