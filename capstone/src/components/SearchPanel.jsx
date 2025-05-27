import React, { useState } from "react";

function SearchPanel({ setSelectedDestinationId }) {
  const [searchQuery, setSearchQuery] = useState("");

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
      })
      .catch(err => {
        console.error("검색 실패: ", err);
        alert("검색 실패: 해당 출입구 이름이 존재하지 않거나 연결이 없습니다.");
      });
  };

  return (
    <div className="search-panel">
      <h2>🔍 목적지 검색</h2>
      <input
        type="text"
        placeholder="예: 인하대학교 4호관 남쪽 출입구"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
}

export default SearchPanel;

