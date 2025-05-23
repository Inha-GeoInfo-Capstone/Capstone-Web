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

  // 건물 출입구 마커 표시 관련 코드
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

  // 도로 중심 마커 표시 관련 코드 
  useEffect(() => {
    if (!map) return;

    fetch("http://localhost:8080/api/road-centers")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((center) => {
          new window.google.maps.Marker({
            position: { lat: center.latitude, lng: center.longitude },
            map: map,
            title: `도로 중심점 ${center.id}`,
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
          });
        });
      })
      .catch((error) => {
        console.error("Error loading road centers:", error);
      });

    // 원하는 선만 표시하는 로직 
    fetch("http://localhost:8080/api/road-links")
      .then((res) => res.json())
      .then((links) => {
        links.forEach((link) => {
          const path = [
            { lat: link.from.latitude, lng: link.from.longitude },
            { lat: link.to.latitude, lng: link.to.longitude },
          ];

          new window.google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: "#00BFFF",
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: map,
          });
        });
      })
      .catch((error) => {
        console.error("Error loading road links:", error);
      });
  }, [map]);

// 최단 경로를 선 표시하는 로직 추가 
  useEffect(() => {
    if (!map) return;

    // 우선 테스트용으로 현재 위치와 도착지 15번 노드를 통해 잘 나오는지 확인 
    const destinationId = 15;

    fetch(`http://localhost:8080/api/navigation/shortest-path?destinationId=${destinationId}`)
      .then((res) => res.json())
      .then((pathCoords) => {
        const polylinePath = pathCoords.map(coord => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: "#FF0000", // 최단경로는 빨간색
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map: map,
        });
      })
      .catch((err) => {
        console.error("❌ 최단 경로 호출 실패", err);
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
