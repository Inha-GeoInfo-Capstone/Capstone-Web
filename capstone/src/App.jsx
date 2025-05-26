import React from "react";
import "./styles/App.css";
import MapContainer from "./components/MapContainer";
import SearchPanel from "./components/SearchPanel";

function App() {
  return (
    <div className="app-container">
      <SearchPanel />
      <MapContainer />
    </div>
  );
}

export default App;
