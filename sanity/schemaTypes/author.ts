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
    defineField({
      name: "availabilitySettings",
      title: "Availability Settings",
      type: "object",
      fields: [
        defineField({
          name: "bookingNotice",
          title: "Booking Notice (hours)",
          type: "number",
          initialValue: 24,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "appointmentDuration",
          title: "Appointment Duration (minutes)",
          type: "number",
          initialValue: 60,
          validation: (Rule) => Rule.required().min(15),
        }),
        defineField({
          name: "breakBetweenAppointments",
          title: "Break Between Appointments (minutes)",
          type: "number",
          initialValue: 15,
          validation: (Rule) => Rule.required().min(0),
        }),
  ],
}),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
});
