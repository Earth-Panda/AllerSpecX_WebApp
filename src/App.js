import React, { useState, useEffect } from 'react';
import * as ble from "./ble.js";
import * as CONSTS from "./consts.js"

const AllerSpecX_App = () => {

  // State Holders
  const [bleStatus, updateDevice] = useState({
    availableDevices: [],
    error: null,
    connection: CONSTS.UNCONNECTED, // 0 is unconnected, 1 is connecting, 2 is connected
    selected: {
      device: null,
      services: [],
    }
  });

  
  return (
    <div>
      <h1>AllerSpecX Device Interface</h1>

      {/* Display error if there's one */}
      {bleStatus.error && <p style={{ color: 'red' }}>{bleStatus.error}</p>}

      {/* Scan button */}
      <button onClick={ () => {ble.requestBluetoothDevices(bleStatus, updateDevice)} }>Scan for AllerSpecX Device</button>

      {/* List of devices found */}
      <div>
        <h2>Found Devices:</h2>
        {bleStatus.availableDevices?.length > 0 ? (
          <ul>
            {bleStatus.availableDevices.map((device, index) => (
              <li key={index}>
                <strong>{device.name || 'Unnamed Device'}</strong> (ID: {device.id})
                <button onClick={() => {
                  bleStatus.selected.device = device;
                  ble.handleDeviceSelect(bleStatus, updateDevice)
                } } disabled={bleStatus.selected.connection}>
                  {CONSTS.getStatus(bleStatus.connection)}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No devices found yet.</p>
        )}
      </div>

    </div>
  );
};

export default AllerSpecX_App;
