import { Entity, Field, Fields } from "remult";
import { Category } from "./category";

@Entity("products", {
  allowApiCrud: true
})
export class Product {
  @Fields.autoIncrement()
  id = 0;
  @Fields.string()
  name = '';
  @Fields.string()
  material = '';
  @Fields.string()
  description = '';
  @Fields.number()
  price = 0;
  //TODO - I don't like this structure
  @Fields.object<{ id: number }>()
  category!: { id: number }
}

