import { Entity, Fields } from "remult";

@Entity("categories", {
  allowApiCrud: true
})
export class Category {
  @Fields.autoIncrement()
  id = 0;
  @Fields.string()
  title = ""
}