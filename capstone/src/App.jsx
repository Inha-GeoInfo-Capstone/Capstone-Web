import { useEffect, useRef, useState } from "react";

function App() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  const [gateMarkers, setGateMarkers] = useState([]);
  const [centerMarkers, setCenterMarkers] = useState([]);
  const [roadPolylines, setRoadPolylines] = useState([]);
  const [pathPolyline, setPathPolyline] = useState(null);

  // Google Maps API 로딩
  useEffect(() => {
    if (window.google && window.google.maps) {
      const center = { lat: 37.45, lng: 126.6535 };
      const mapObj = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 16,
      });
      setMap(mapObj);
      return;
    }

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

  // 건물 출입구 마커
  useEffect(() => {
    if (!map) return;

    gateMarkers.forEach(marker => marker.setMap(null)); // 이전 마커 제거

    fetch("http://localhost:8080/api/gate-points")
      .then((res) => res.json())
      .then((data) => {
        const markers = data.map((point) => new window.google.maps.Marker({
          position: { lat: point.latitude, lng: point.longitude },
          map: map,
          title: `Gate ${point.id}`,
        }));
        setGateMarkers(markers); // 새 마커 저장
      })
      .catch((error) => {
        console.error("Error loading gate points:", error);
      });
  }, [map]);

  // 도로 중심 마커 + 링크 라인
  useEffect(() => {
    if (!map) return;

    centerMarkers.forEach(marker => marker.setMap(null));
    roadPolylines.forEach(poly => poly.setMap(null));

    fetch("http://localhost:8080/api/road-centers")
      .then((res) => res.json())
      .then((data) => {
        const markers = data.map((center) => new window.google.maps.Marker({
          position: { lat: center.latitude, lng: center.longitude },
          map: map,
          title: `도로 중심점 ${center.id}`,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        }));
        setCenterMarkers(markers);
      });

    fetch("http://localhost:8080/api/road-links")
      .then((res) => res.json())
      .then((links) => {
        const polylines = links.map((link) => new window.google.maps.Polyline({
          path: [
            { lat: link.from.latitude, lng: link.from.longitude },
            { lat: link.to.latitude, lng: link.to.longitude },
          ],
          geodesic: true,
          strokeColor: "#00BFFF",
          strokeOpacity: 1.0,
          strokeWeight: 4,
          map: map,
        }));
        setRoadPolylines(polylines);
      });
  }, [map]);

  // 최단 경로 그리기
  useEffect(() => {
    if (!map) return;

    if (pathPolyline) {
      pathPolyline.setMap(null); // 이전 경로 제거
    }

    const destinationId = 15;

    fetch(`http://localhost:8080/api/navigation/shortest-path?destinationId=${destinationId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((pathCoords) => {
        if (!Array.isArray(pathCoords) || pathCoords.length === 0) {
          throw new Error("❗ 최단 경로 응답이 올바르지 않음");
        }

        const polylinePath = pathCoords.map(coord => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        const newPolyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map: map,
        });

        setPathPolyline(newPolyline);
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
