import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const availability = defineType({
  name: "availability",
  title: "Availability",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "provider",
      title: "Service Provider",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dayOfWeek",
      title: "Day of Week",
      type: "string",
      options: {
        list: [
          { title: "Monday", value: "monday" },
          { title: "Tuesday", value: "tuesday" },
          { title: "Wednesday", value: "wednesday" },
          { title: "Thursday", value: "thursday" },
          { title: "Friday", value: "friday" },
          { title: "Saturday", value: "saturday" },
          { title: "Sunday", value: "sunday" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Start Time",
      type: "string",
      description: "Format: HH:MM (24-hour)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string",
      description: "Format: HH:MM (24-hour)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isAvailable",
      title: "Is Available",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "recurringWeekly",
      title: "Recurring Weekly",
      type: "boolean",
      initialValue: true,
      description: "Does this availability repeat every week?",
    }),
    defineField({
      name: "specificDate",
      title: "Specific Date",
      type: "date",
      description: "Only required if not recurring weekly",
      hidden: ({ document }) => Boolean(document?.recurringWeekly),
    }),
  ],
  preview: {
    select: {
      provider: "provider.name",
      day: "dayOfWeek",
      start: "startTime",
      end: "endTime",
    },
    prepare({ provider, day, start, end }) {
      return {
        title: `${provider || "Unknown Provider"} - ${day || "Unknown day"}`,
        subtitle: `${start || "?"} to ${end || "?"}`,
      };
    },
  },
});