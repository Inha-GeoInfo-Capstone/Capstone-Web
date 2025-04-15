import { useEffect, useRef, useState } from "react";

function App() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const center = { lat: 37.45, lng: 126.6535 };
      const mapObj = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 16,
      });

      setMap(mapObj); 
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!map) return;

    fetch("http://localhost:8080/api/gate-points")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((point) => {
          const marker = new window.google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            map: map,
            title: `Gate ${point.id}`,
          });
        });
      })
      .catch((error) => {
        console.error("Error loading gate points:", error);
      });
  }, [map]);

  return (
    <div>
      <h1>인하대학교 출입구 지도</h1>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
      ></div>
    </div>
  );
}

export default App;
