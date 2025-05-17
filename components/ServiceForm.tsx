
"use client";

import { z } from "zod";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";

import { createService } from "@/lib/action";
import { serviceFormSchema } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ServiceForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");

  const [formState, setFormState] = useState({
    title: "",
    shortDescription: "",
    category: "",
    pricing: "",
    description: "",
    views:0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({
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

  const handleFormSubmit = async (formData: FormData) => {
    setErrors({});
    setServerError("");

    try {
      if (!imageFile) {
        setErrors(prev => ({ ...prev, imageFile: "Please select an image" }));
        toast({
          title: "Validation Error",
          description: "An image is required",
          variant: "destructive",
        });
        return;
      }

      const values = {
        ...formState,
      };

      await serviceFormSchema.parseAsync(values);

      startTransition(async () => {
        try {
          Object.entries(values).forEach(([key, value]) => {
            if (key !== "description") {
              formData.set(key, String(value));
            }
          });

          formData.set("image", imageFile);

          const result = await createService({}, formData, values.description);

          if (result.status === "SUCCESS") {
            toast({
              title: "Success",
              description: "Your service has been created successfully",
            });
            router.push(`/service/${result._id}`);
          } else {
            setServerError(result.error || "Failed to create service");
            toast({
              title: "Error",
              description: result.error || "Failed to create service",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Submission error:", error);
          setServerError("Failed to submit the form");
          toast({
            title: "Error",
            description: "Failed to submit the form",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as unknown as Record<string, string>);
        toast({
          title: "Validation Error",
          description: "Please check your input and try again",
          variant: "destructive",
        });
      } else {
        setServerError("An unexpected error occurred");
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const formFields = [
    {
      id: "title",
      label: "Service Title",
      placeholder: "e.g., Professional Web Development Services",
      type: "input",
      required: true,
    },
    {
      id: "shortDescription",
      label: "Short Description",
      placeholder: "Briefly describe your service (will appear in search results)",
      type: "textarea",
      required: true,
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "design", label: "Design & Creative" },
        { value: "development", label: "Development & IT" },
        { value: "marketing", label: "Marketing" },
        { value: "business", label: "Business" },
        { value: "lifestyle", label: "Lifestyle" },
        { value: "other", label: "Other" },
      ],
    },
    {
      id: "pricing",
      label: "Pricing",
      placeholder: "$50/hour or starting at $500",
      type: "input",
      required: true,
    },
  ];

  return (
    <form action={handleFormSubmit} className="space-y-8">
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <p>{serverError}</p>
        </div>
      )}

      {formFields.map((field, index) => (
        <motion.div
          key={field.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="space-y-2"
        >
          <label htmlFor={field.id} className="text-md font-medium text-purple-900">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === "input" && (
            <Input
              id={field.id}
              name={field.id}
              value={formState[field.id as keyof typeof formState] as string}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="rounded-xl border-purple-200 bg-white px-4 py-3 focus-visible:ring-purple-400"
              required={field.required}
              placeholder={field.placeholder}
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              id={field.id}
              name={field.id}
              value={formState[field.id as keyof typeof formState] as string}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="rounded-xl min-h-24 border-purple-200 bg-white px-4 py-3 focus-visible:ring-purple-400"
              required={field.required}
              placeholder={field.placeholder}
              rows={3}
            />
          )}

          {field.type === "select" && (
            <Select
              value={formState.category}
              onValueChange={(value: string) => handleChange("category", value)}
            >
              <SelectTrigger className="rounded-xl border-purple-200 bg-white px-4 py-3 focus-visible:ring-purple-400">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {errors[field.id] && (
            <p className="text-sm text-red-500 mt-1">{errors[field.id]}</p>
          )}
        </motion.div>
      ))}

      {/* Image Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: formFields.length * 0.05 }}
        className="space-y-2"
      >
        <label htmlFor="imageUpload" className="text-md font-medium text-purple-900">
          Upload Service Image <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <Input
            id="imageUpload"
            name="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                // Clear any previous image error
                if (errors.imageFile) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.imageFile;
                    return newErrors;
                  });
                }
              }
            }}
            className="rounded-xl border-purple-200 bg-white px-4 py-3 flex-1"
          />
        </div>
        {imageFile && (
          <p className="text-sm text-green-600">Image selected: {imageFile.name} ✓</p>
        )}
        {errors.imageFile && <p className="text-sm text-red-500">{errors.imageFile}</p>}
      </motion.div>

      {/* Markdown Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: (formFields.length + 1) * 0.05 }}
        className="space-y-2"
        data-color-mode="light"
      >
        <label htmlFor="description" className="text-md font-medium text-purple-900">
          Detailed Description <span className="text-red-500">*</span>
        </label>

        <MDEditor
          id="description"
          value={formState.description}
          preview="edit"
          height={300}
          onChange={(value) => handleChange("description", value as string)}
          className="rounded-xl overflow-hidden"
          style={{
            borderRadius: 12,
            overflow: "hidden",
          }}
          textareaProps={{
            placeholder:
              "Provide a detailed description of your service, your experience, and what clients can expect",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: (formFields.length + 2) * 0.05 }}
        className="pt-4"
      >
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 rounded-xl"
        >
          {isPending ? "Publishing..." : "Publish Your Service"}
          <Send className="size-5 ml-2" />
        </Button>
      </motion.div>
    </form>
  );
};

export default ServiceForm;