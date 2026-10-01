import { useState } from "react";
import BookForm from "./components/BookForm";
import FilterBar from "./components/FilterBar";
import BookCard from "./components/BookCard";
import { STATUSES } from "./constants";
import "./App.css";

const INITIAL_BOOKS = [
  { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", pages: 310, status: "Finished" },
  { id: 2, title: "Cosmos", author: "Carl Sagan", genre: "Science", pages: 396, status: "Reading" },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen", genre: "Fiction", pages: 279, status: "Want to read" },
  { id: 4, title: "Sapiens", author: "Yuval Noah Harari", genre: "History", pages: 443, status: "Want to read" },
];

let nextId = 5; // ids are never reused, so keys stay unique and stable

export default function App() {
  // PARENT STATE: data shared by several children
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [filter, setFilter] = useState("All");
  // resetKeys[id] is part of a card's key; bumping it remounts only that card
  const [resetKeys, setResetKeys] = useState({});

  console.log("App render");

  const addBook = (book) => setBooks((prev) => [{ ...book, id: nextId++, status: "Want to read" }, ...prev]);
  const removeBook = (id) => setBooks((prev) => prev.filter((b) => b.id !== id));
  const changeStatus = (id, status) =>
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  const reverseList = () => setBooks((prev) => [...prev].reverse());
  const sortShortest = () => setBooks((prev) => [...prev].sort((a, b) => a.pages - b.pages));
  const sortLongest = () => setBooks((prev) => [...prev].sort((a, b) => b.pages - a.pages));
  const resetBook = (id) => setResetKeys((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  // Derived values, not state. Filtering never removes books from the tree:
  // non-matching cards stay mounted (just hidden), so their local state survives.
  const matchesFilter = (book) => filter === "All" || book.status === filter;
  const visibleCount = books.filter(matchesFilter).length;

  const counts = { All: books.length };
  STATUSES.forEach((s) => (counts[s] = books.filter((b) => b.status === s).length));
  const pagesFinished = books.filter((b) => b.status === "Finished").reduce((sum, b) => sum + b.pages, 0);

  return (
    <div className="app">
      <header className="masthead">
        <h1>Reading List</h1>
        <p className="stats">
          <strong>{counts.Finished}</strong> finished, <strong>{pagesFinished}</strong> pages
        </p>
      </header>

      <BookForm onAdd={addBook} />

      <FilterBar filter={filter} counts={counts} onFilter={setFilter} onReverse={reverseList} onSortShortest={sortShortest} onSortLongest={sortLongest} />

      {visibleCount === 0 && (
        <p className="empty">Nothing on this shelf yet. Add a book above or pick another filter.</p>
      )}

      <ul className="book-list">
        {books.map((book) => (
          // Key = stable id (+ reset counter), never the array index
          <BookCard
            key={`${book.id}-${resetKeys[book.id] || 0}`}
            book={book}
            hidden={!matchesFilter(book)}
            onStatusChange={changeStatus}
            onRemove={removeBook}
            onReset={resetBook}
          />
        ))}
      </ul>
    </div>
  );
}
