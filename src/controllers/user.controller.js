import { User } from "../models/user.model.js";
import { crud } from "./crud.factory.js";

export const users = crud(User, {
  populate: { path: "plan", select: "title price currency" },
  filters: ["plan"],
  search: ["name", "email", "phone"],
});
