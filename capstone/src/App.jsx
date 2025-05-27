import React from "react";
import "./styles/App.css";
import MapContainer from "./components/MapContainer";
import SearchPanel from "./components/SearchPanel";
import { useState } from "react";

function App() {
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  return (
    <div className="app-container">
    <SearchPanel setSelectedDestinationId={setSelectedDestinationId} />
    <MapContainer selectedDestinationId={selectedDestinationId} setSelectedDestinationId={setSelectedDestinationId} />
  </div>
  );
}

export default App;
