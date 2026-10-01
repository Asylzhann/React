import { useState } from "react";
import { GENRES } from "../constants";

export default function BookForm({ onAdd }) {
  // CHILD STATE: input values only matter to this form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [pages, setPages] = useState(250);

  console.log("BookForm render");

  const canAdd = title.trim() && author.trim();

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({ title: title.trim(), author: author.trim(), genre, pages: Number(pages) });
    setTitle("");
    setAuthor("");
  };

  return (
    <section className="form" aria-label="Add a book">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" aria-label="Title" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" aria-label="Author" />
      <select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Genre">
        {GENRES.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <label>
        Pages
        <input type="number" min="10" step="10" value={pages} onChange={(e) => setPages(e.target.value)} />
      </label>
      <button className="primary" onClick={handleAdd} disabled={!canAdd}>
        Add book
      </button>
    </section>
  );
}
