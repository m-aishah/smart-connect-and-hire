// sanity/schemaTypes/service.ts
import { defineType, defineField } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      validation: (Rule) => Rule.required().min(10).max(200),
    }),
    defineField({
      name: "description",
      title: "Detailed Description",
      type: "markdown", 
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Design & Creative", value: "design" },
          { title: "Development & IT", value: "development" },
          { title: "Marketing", value: "marketing" },
          { title: "Business", value: "business" },
          { title: "Lifestyle", value: "lifestyle" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "provider",
      title: "Provider",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "views",
      type: "number",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "shortDescription",
      media: "image",
    },
  },
});
