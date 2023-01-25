import { remultExpress } from "remult/remult-express";
import { entities } from "../shared";

export const api = remultExpress({
  entities
})