import { createItem, updateItem } from "./fakeApi";

// The fake API's createItem only keeps `name` and `description`.
// Because fakeApi.js must not be modified, a new pet is saved in two requests:
// 1) createItem makes the record, 2) updateItem adds the remaining fields.
export async function createPet(values) {
  const { name, description, ...details } = values;
  const created = await createItem({ name, description });
  try {
    return await updateItem(created.id, details);
  } catch (err) {
    // The pet exists, but without its details. Tell the caller which one it is.
    err.createdId = created.id;
    throw err;
  }
}
