import { useEffect, useRef } from "react";

function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const inhaUniversity = { lat: 37.45, lng: 126.6535 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: inhaUniversity,
        zoom: 16,
        mapTypeControl: true,
        fullscreenControl: true,
      });

      new window.google.maps.Marker({
        position: inhaUniversity,
        map,
        title: "Inha University",
      });
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>인하대학교 중심으로 지도 생성</h1>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "600px",
          margin: "0 auto",
          border: "2px solid #ccc",
        }}
      ></div>
    </div>
  );
}

export default App;