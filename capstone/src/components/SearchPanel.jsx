import React, { useState } from "react";

function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    alert(`검색 예정: ${searchQuery}`);
  };

  return (
    <div className="search-panel">
      <h2>🔍 목적지 검색</h2>
      <input
        type="text"
        placeholder="예: 인하대학교 본관"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
}

export default SearchPanel;
