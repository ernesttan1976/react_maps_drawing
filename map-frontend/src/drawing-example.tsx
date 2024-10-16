import React, {useState} from 'react';
import {ControlPosition, Map, MapControl} from '@vis.gl/react-google-maps';

import {UndoRedoControl} from './undo-redo-control';
import {useDrawingManager} from './use-drawing-manager';
import ControlPanel from './control-panel';

import brightColorsStyles from './map-styles/bright-colors.ts';
import vitaminCStyles from './map-styles/vitamin-c.ts';
import MapHandler from './map-handler.tsx';
import {CustomMapControl} from './map-control.tsx';

// XWB
const defaultView = {
  lat: -22.8953818,
  lng: 150.4365193,
  zoom: 9
}

const MapTypeId = {
  HYBRID: 'hybrid',
  ROADMAP: 'roadmap',
  SATELLITE: 'satellite',
  TERRAIN: 'terrain'
};
export type MapConfig = {
  id: string;
  label: string;
  mapId?: string;
  mapTypeId?: string;
  styles?: google.maps.MapTypeStyle[];
};

const MAP_CONFIGS: MapConfig[] = [
  {
    id: 'terrain2',
    label: 'Terrain ("light" mapId)',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.TERRAIN
  },
  {
    id: 'light',
    label: 'Light',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.ROADMAP
  },
  {
    id: 'dark',
    label: 'Dark',
    mapId: '739af084373f96fe',
    mapTypeId: MapTypeId.ROADMAP
  },
  {
    id: 'satellite',
    label: 'Satellite (no mapId)',
    mapTypeId: MapTypeId.SATELLITE
  },
  {
    id: 'hybrid',
    label: 'Hybrid (no mapId)',
    mapTypeId: MapTypeId.HYBRID
  },
  {
    id: 'terrain',
    label: 'Terrain (no mapId)',
    mapTypeId: MapTypeId.TERRAIN
  },
  {
    id: 'styled1',
    label: 'Raster / "Bright Colors" (no mapId)',
    mapTypeId: MapTypeId.ROADMAP,
    styles: brightColorsStyles
  },
  {
    id: 'styled2',
    label: 'Raster / "Vitamin C" (no mapId)',
    mapTypeId: MapTypeId.ROADMAP,
    styles: vitaminCStyles
  },
  {
    id: 'satellite2',
    label: 'Satellite ("light" mapId)',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.SATELLITE
  },
  {
    id: 'hybrid2',
    label: 'Hybrid ("light" mapId)',
    mapId: '49ae42fed52588c3',
    mapTypeId: MapTypeId.HYBRID
  }
];

const DrawingExample = () => {
  const drawingManager = useDrawingManager();
  const [mapConfig, setMapConfig] = useState(MAP_CONFIGS[0]);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  return (
    <>
      <Map
        defaultZoom={defaultView.zoom}
        defaultCenter={{lat: defaultView.lat, lng: defaultView.lng}}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={mapConfig.mapId || null}
        mapTypeId={mapConfig.mapTypeId}
        styles={mapConfig.styles}
      />

      <ControlPanel 
        mapConfigs={MAP_CONFIGS}
        mapConfigId={mapConfig.id}
        onMapConfigIdChange={id =>
          setMapConfig(MAP_CONFIGS.find(s => s.id === id)!)
        }/>
      <CustomMapControl
            controlPosition={ControlPosition.LEFT_TOP}
            onPlaceSelect={setSelectedPlace}
          />
      <MapControl position={ControlPosition.TOP_CENTER}>
        <UndoRedoControl drawingManager={drawingManager} />
      </MapControl>
      

      <MapHandler place={selectedPlace} />
    </>
  );
};

export default DrawingExample;
