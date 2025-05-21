import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("playlist").title("Playlists"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("availability").title("Availability"),
      S.documentTypeListItem("booking").title("Booking"),
    ]);
