import * as React from 'react';
import type {MapConfig} from './drawing-example';

type ControlPanelProps = {
  mapConfigs: MapConfig[];
  mapConfigId: string;
  onMapConfigIdChange: (id: string) => void;
};

function ControlPanel({
  mapConfigs,
  mapConfigId,
  onMapConfigIdChange
}: ControlPanelProps) {
  return (
    <div className="control-panel">

      <div>
        
        
        <label>Map Configuration</label>
        <select
          value={mapConfigId}
          onChange={ev => onMapConfigIdChange(ev.target.value)}>
          {mapConfigs.map(({id, label}) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="links">
        <a
          href="https://codesandbox.io/s/github/visgl/react-google-maps/tree/main/examples/change-map-styles"
          target="_new">
          Try on CodeSandbox ↗
        </a>

        <a
          href="https://github.com/visgl/react-google-maps/tree/main/examples/change-map-styles"
          target="_new">
          View Code ↗
        </a>
      </div>
    </div>
  );
}

export default React.memo(ControlPanel);