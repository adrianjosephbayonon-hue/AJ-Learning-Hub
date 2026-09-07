import { useState } from "react";
import "./SearchBar.css";

function SearchBar() {
  const [search, setSearch] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    alert(`Searching for: ${search}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>

      <input
        type="text"
        placeholder="Search courses, assignments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button type="submit">
        🔍
      </button>

    </form>
  );
}

export default SearchBar;