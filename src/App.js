import React, { useState } from 'react';

const BluetoothDeviceFinder = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if Web Bluetooth API is supported by the browser
  const checkBluetoothSupport = () => {
    return navigator.bluetooth !== undefined;
  };

  // Function to request Bluetooth devices
  const requestBluetoothDevices = async () => {
    if (!checkBluetoothSupport()) {
      setError('Web Bluetooth is not supported by your browser.');
      return;
    }

    try {
      // Request for available Bluetooth devices
      const devices = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // Accepts all Bluetooth devices
        optionalServices: ['battery_service'], // Optional: add services you may want to access
      });

      // Store the found device in the state
      setDevices((prevDevices) => [...prevDevices, devices]);
    } catch (err) {
      // Handle any errors that may occur
      setError(`Error occurred: ${err.message}`);
    }
  };

  // Handle device selection and connect
  const handleDeviceSelect = async (device) => {
    setIsConnecting(true);
    try {
      // Start pairing process (in reality, you may need to interact with the device further based on its capabilities)
      await device.gatt.connect();
      setSelectedDevice(device);
      setIsConnecting(false);
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <h1>Bluetooth Device Finder</h1>

      {/* Display error if there's one */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Scan button */}
      <button onClick={requestBluetoothDevices}>Scan for Bluetooth Devices</button>

      {/* List of devices found */}
      <div>
        <h2>Found Devices:</h2>
        {devices.length > 0 ? (
          <ul>
            {devices.map((device, index) => (
              <li key={index}>
                <strong>{device.name || 'Unnamed Device'}</strong> (ID: {device.id})
                <button onClick={() => handleDeviceSelect(device)} disabled={isConnecting}>
                  {isConnecting ? 'Connecting...' : 'Pair'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No devices found yet.</p>
        )}
      </div>

      {/* Show connected device details */}
      {selectedDevice && (
        <div>
          <h3>Connected Device:</h3>
          <p>{selectedDevice.name || 'Unnamed Device'} (ID: {selectedDevice.id})</p>
        </div>
      )}
    </div>
  );
};

export default BluetoothDeviceFinder;