import { getItemsList, getItem, createItem, updateItem, deleteItem } from "../api/fakeApi";

// The only file that talks to the API. Pages and hooks call these functions.

// The list endpoint pages its answer, but this app filters, sorts and pages in the browser
// (so everything can live in the URL), so one big page with everything is requested.
const EVERYTHING = 1000;

export async function fetchPets() {
  const result = await getItemsList(`?page=1&limit=${EVERYTHING}`);
  return result.data;
}

export const fetchPet = (id) => getItem(id);

export const editPet = (id, changes) => updateItem(id, changes);

export const removePet = (id) => deleteItem(id);

// The fake API's createItem only keeps `name` and `description`.
// So a new pet is saved in two requests: create the record, then add the other fields.
export async function addPet(values) {
  const { name, description, ...details } = values;
  const created = await createItem({ name, description });
  try {
    return await updateItem(created.id, details);
  } catch (err) {
    err.createdId = created.id; // the pet exists, but without its details
    throw err;
  }
}
