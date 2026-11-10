import { Project } from "../models/project.model.js";
import { crud } from "./crud.factory.js";

export const projects = crud(Project, {
  populate: [
    { path: "user", select: "name phone" },
    { path: "plan", select: "title kind" },
  ],
  sort: "-date",
  filters: ["status", "featured", "user", "plan"],
  search: ["title", "description"],
});
