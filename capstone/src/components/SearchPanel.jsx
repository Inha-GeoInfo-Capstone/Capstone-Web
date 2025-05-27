import React, { useState, useEffect } from "react";


function SearchPanel({ setSelectedDestinationId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      return;
    }

    fetch(`http://localhost:8080/api/navigation/gate-name-suggestions?query=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch(() => setSuggestions([]));
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("출입구 이름을 입력해주세요.");
      return;
    }

    // 이름으로 gate Id 검색
    fetch(`http://localhost:8080/api/navigation/gate-id-by-name?name=${encodeURIComponent(searchQuery)}`)
      .then(res => {
        if (!res.ok) throw new Error("출입구 이름을 찾을 수 없습니다.");
        return res.json();
      })
      .then(gateId => {
        return fetch(`http://localhost:8080/api/navigation/gate-to-road-center?gateId=${gateId}`);
      })
      .then(res => res.json())
      .then(centerId => {
        console.log("목적지 도로 중심 ID: ", centerId);
        setSelectedDestinationId(centerId); 
        setSuggestions([]);
      })
      .catch(err => {
        console.error("검색 실패: ", err);
        alert("검색 실패: 해당 출입구 이름이 존재하지 않거나 연결이 없습니다.");
      });
  };

  return (
    <div className="search-panel" style={{ position: "relative" }}>
      <h2>🔍 목적지 검색</h2>
      <input
        type="text"
        placeholder="예: 인하대학교 4호관 남쪽 출입구"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={() => handleSearch()}>검색</button>
      {suggestions.length > 0 && (
        <div className="suggestions-box" style={{
          position: "absolute",
          top: "100%",
          left: 0,
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          width: "100%",
          maxHeight: "200px",
          overflowY: "auto",
          zIndex: 1000
        }}>
          {suggestions.map((name, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onClick={() => {
                setSearchQuery(name);    
                setSuggestions([]);       
                setTimeout(() => handleSearch(), 0);      
              }}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee"
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPanel;

