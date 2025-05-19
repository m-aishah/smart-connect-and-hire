import { CalendarIcon } from "@sanity/icons";
import { defineType, defineField } from "sanity";

export const booking = defineType({
  name: "booking",
  title: "Booking",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "seeker",
      title: "Service Seeker",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "provider",
      title: "Service Provider",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "service",
      title: "Service",
      type: "reference",
      to: [{ type: "service" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bookingDate",
      title: "Booking Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Start Time",
      type: "string", // Format: HH:MM (24-hour)
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string", // Format: HH:MM (24-hour)
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      seeker: "seeker.name",
      provider: "provider.name",
      date: "bookingDate",
      status: "status",
    },
    prepare({ seeker, provider, date, status }) {
      return {
        title: `${seeker || "Unknown"} → ${provider || "Unknown"}`,
        subtitle: `${date || "No date"} (${status || "pending"})`,
      };
    },
  },
});