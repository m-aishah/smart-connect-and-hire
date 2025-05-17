import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "password",
      type: "string",
      hidden: true, // We'll store hashed passwords, but hide them in the studio
    }),
    defineField({
      name: "userType",
      title: "User Type",
      type: "string",
      options: {
        list: [
          { title: "Service Provider", value: "provider" },
          { title: "Service Seeker", value: "seeker" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "url",
    }),
    defineField({
      name: "bio",
      type: "text",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
});
