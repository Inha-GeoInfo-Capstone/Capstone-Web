import { useEffect, useRef, useState } from "react";

function MapContainer({ selectedDestinationId }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  const [gateMarkers, setGateMarkers] = useState([]);
  const [centerMarkers, setCenterMarkers] = useState([]);
  const [roadPolylines, setRoadPolylines] = useState([]);
  const [pathPolyline, setPathPolyline] = useState(null);
  const [nearestPathPolyline, setNearestPathPolyline] = useState(null);

  // 현재 위치 관련 상태
  const [currentLocation, setCurrentLocation] = useState(null);
  const currentMarkerRef = useRef(null);

  
  // const [selectedDestinationId, setSelectedDestinationId] = useState(null);

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

    gateMarkers.forEach(marker => marker.setMap(null));

    fetch("http://localhost:8080/api/gate-points")
      .then((res) => res.json())
      .then((data) => {
        const markers = data.map((point) => {
          const marker = new window.google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            map: map,
            title: `Gate ${point.id}`,
          });

          marker.addListener("click", () => {
          fetch(`http://localhost:8080/api/navigation/gate-to-road-center?gateId=${point.id}`)
            .then(res => res.json())
            .then(centerId => {
              console.log("💡 도로 중심 ID 수신:", centerId);
              setSelectedDestinationId(Number(centerId)); 
            })
            .catch(err => console.error("🚨 게이트 매핑 실패", err));
        });

        return marker;
        });

        setGateMarkers(markers);
      })
      .catch((error) => {
        console.error("Error loading gate points:", error);
      });
  }, [map]);

  // 도로 중심점 마커 + 도로 링크 선
  /*
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
  */

  // 현재 위치 마커 주기적 갱신
  useEffect(() => {
    if (!map) return;

    const interval = setInterval(() => {
      fetch("http://localhost:8080/api/navigation/current-location")
        .then((res) => res.json())
        .then((data) => {
          const coords = { lat: data.latitude, lng: data.longitude };
          setCurrentLocation(coords);

          if (!currentMarkerRef.current) {
            currentMarkerRef.current = new window.google.maps.Marker({
              position: coords,
              map: map,
              title: "실시간 내 위치 (Flask)",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: "#00F",
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "#FFF",
              },
            });
          } else {
            currentMarkerRef.current.setPosition(coords);
          }
        })
        .catch((err) => console.error("📡 위치 정보 수신 실패", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [map]);

  // 현재 위치 → 가장 가까운 도로 중심점 연결선 
  useEffect(() => {
    if (!map || !currentLocation) return;

    fetch(`http://localhost:8080/api/navigation/nearest-connection`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length < 2) return;

        if (nearestPathPolyline) nearestPathPolyline.setMap(null);

        const path = data.map(p => ({ lat: p.lat, lng: p.lng }));

        const newLine = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#FFA500",
          strokeOpacity: 1.0,
          strokeWeight: 4,
          map: map,
        });

        setNearestPathPolyline(newLine);
      })
      .catch(err => console.error("🛑 도로 중심 연결 실패", err));
  }, [map, currentLocation]);

  // 최단경로 (현재 위치 → 선택한 목적지까지)
  useEffect(() => {
    if (!map || !selectedDestinationId || !currentLocation) return;

    if (pathPolyline) {
      pathPolyline.setMap(null);
    }

    fetch(`http://localhost:8080/api/navigation/shortest-path-from-current?destinationId=${selectedDestinationId}`)
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
  }, [map, selectedDestinationId,currentLocation]);

  return (
    <div ref={mapRef} className="map-container"></div>
  );
}

export default MapContainer;
