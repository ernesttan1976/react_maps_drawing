import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const defaultView = {
  lat: -22.8953818,
  lng: 150.4365193,
  zoom: 9
}
function MapComponent() {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const [routes, setRoutes] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [currentRoute, setCurrentRoute] = useState([]);
  const [currentGeofence, setCurrentGeofence] = useState([]);
  const [mapMode, setMapMode] = useState('view'); // 'view', 'route', 'geofence'

  useEffect(() => {
    fetchRoutes();
    fetchGeofences();
  }, []);

  useEffect(() => {
    if (map && mapsLib) {
      drawRoutes();
      drawGeofences();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mapsLib, routes, geofences]);

  const fetchRoutes = async () => {
    const response = await fetch('/api/routes');
    const data = await response.json();
    setRoutes(data.data.routes);
  };

  const fetchGeofences = async () => {
    const response = await fetch('/api/geofences');
    const data = await response.json();
    setGeofences(data.data.geofences);
  };

  const drawRoutes = useCallback(() => {
    routes.forEach(route => {
      const path = JSON.parse(route.waypoints);
      new mapsLib.Polyline({
        path: path,
        map: map,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
    });
  }, [map, mapsLib, routes]);

  const drawGeofences = useCallback(() => {
    geofences.forEach(geofence => {
      const path = JSON.parse(geofence.coordinates);
      new mapsLib.Polygon({
        paths: path,
        map: map,
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.35
      });
    });
  }, [map, mapsLib, geofences]);

  const handleMapClick = useCallback((event) => {
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;

    if (mapMode === 'route') {
      setCurrentRoute(prev => [...prev, { lat, lng }]);
    } else if (mapMode === 'geofence') {
      setCurrentGeofence(prev => [...prev, { lat, lng }]);
    }
  }, [mapMode]);

  const saveRoute = async () => {
    const name = prompt('Enter route name:');
    if (name) {
      await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, waypoints: currentRoute }),
      });
      fetchRoutes();
      setCurrentRoute([]);
      setMapMode('view');
    }
  };

  const saveGeofence = async () => {
    const name = prompt('Enter geofence name:');
    if (name) {
      await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, coordinates: currentGeofence }),
      });
      fetchGeofences();
      setCurrentGeofence([]);
      setMapMode('view');
    }
  };

  return (
    <>
      <Map
        zoom={defaultView.zoom}
        center={{ lat: defaultView.lat, lng: defaultView.lng }}
        onClick={handleMapClick}
      >
        {currentRoute.map((point, index) => (
          <Marker key={`route-${index}`} position={point} />
        ))}
        {currentGeofence.map((point, index) => (
          <Marker key={`geofence-${index}`} position={point} />
        ))}
      </Map>
      <div style={{ position: 'absolute', top: 10, left: 220 }}>
        <button onClick={() => setMapMode('view')}>View</button>
        <button onClick={() => setMapMode('route')}>Create Route</button>
        <button onClick={() => setMapMode('geofence')}>Create Geofence</button>
        {mapMode === 'route' && (
          <button onClick={saveRoute}>Save Route</button>
        )}
        {mapMode === 'geofence' && (
          <button onClick={saveGeofence}>Save Geofence</button>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ height: '100vh', width: '100%' }}>
        <MapComponent />
      </div>
    </APIProvider>
  );
}

export default App;