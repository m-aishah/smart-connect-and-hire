"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

import { signUpSchema } from "@/lib/validation";
import { signUp } from "@/lib/actions/auth";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "seeker" as "provider" | "seeker",
  });
  
  // Debug logging to help track userType changes
  useEffect(() => {
    console.log("Current userType:", formData.userType);
  }, [formData.userType]);
  
  const handleChange = (field: string, value: any) => {
    console.log(`Updating ${field} to:`, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    
    try {
      signUpSchema.parse(formData);
      
      console.log("Form before submission:", formData);
      const result = await signUp(
        formData.name,
        formData.email,
        formData.password,
        formData.userType
      );
      
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Please sign in with your new account",
        });
        router.push("/auth/signin");
      } else {
        toast({
          title: "Sign up failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as Record<string, string>);
        
        toast({
          title: "Validation Error",
          description: "Please check your input and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-work-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image src="/logo.png" alt="logo" width={143} height={30} />
          </Link>
          <h2 className="text-3xl font-bold text-purple-900">Create an Account</h2>
          <p className="mt-2 text-gray-600">Join our community of service providers and seekers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            <label htmlFor="name" className="text-md font-medium text-purple-900">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="pl-10 rounded-xl border-purple-200 bg-white focus-visible:ring-purple-400"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-2"
          >
            <label htmlFor="email" className="text-md font-medium text-purple-900">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10 rounded-xl border-purple-200 bg-white focus-visible:ring-purple-400"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-2"
          >
            <label htmlFor="password" className="text-md font-medium text-purple-900">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 pr-10 rounded-xl border-purple-200 bg-white focus-visible:ring-purple-400"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-2"
          >
            <label htmlFor="confirmPassword" className="text-md font-medium text-purple-900">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="pl-10 rounded-xl border-purple-200 bg-white focus-visible:ring-purple-400"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </motion.div>

          {/* User Type Selection - Integrated directly into this component */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="space-y-3"
          >
            <h3 className="text-md font-medium text-purple-900">
              I am a <span className="text-red-500">*</span>
            </h3>
            <div className="flex flex-col space-y-3">
              {/* Service Seeker Option */}
              <div 
                className={cn(
                  "flex items-center space-x-3 border p-4 rounded-xl cursor-pointer",
                  formData.userType === "seeker" 
                    ? "border-purple-600 bg-purple-50" 
                    : "border-purple-200"
                )}
                onClick={() => handleChange("userType", "seeker")}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="radio"
                    id="seeker"
                    name="userType"
                    value="seeker"
                    checked={formData.userType === "seeker"}
                    onChange={() => handleChange("userType", "seeker")}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                </div>
                <Label htmlFor="seeker" className="cursor-pointer">
                  <span className="font-medium">Service Seeker</span>
                  <p className="text-sm text-gray-500">I'm looking for services</p>
                </Label>
              </div>

              {/* Service Provider Option */}
              <div 
                className={cn(
                  "flex items-center space-x-3 border p-4 rounded-xl cursor-pointer",
                  formData.userType === "provider" 
                    ? "border-purple-600 bg-purple-50" 
                    : "border-purple-200"
                )}
                onClick={() => handleChange("userType", "provider")}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="radio"
                    id="provider"
                    name="userType"
                    value="provider"
                    checked={formData.userType === "provider"}
                    onChange={() => handleChange("userType", "provider")}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                </div>
                <Label htmlFor="provider" className="cursor-pointer">
                  <span className="font-medium">Service Provider</span>
                  <p className="text-sm text-gray-500">I want to offer my services</p>
                </Label>
              </div>
            </div>
            {errors.userType && (
              <p className="text-sm text-red-500 mt-1">{errors.userType}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 rounded-xl"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-purple-700 hover:text-purple-800 font-medium">
              Sign In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}