import React, { useState, useEffect } from 'react';

function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

function handle_change(event) {
  var enc = new TextDecoder("utf-8");
  console.log(`Received Value: ${event.target.value.buffer}`);
  console.log(event)
  console.log(enc.decode(event.target.value.buffer));
}

const BluetoothBLEConnect = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceServices, setDeviceServices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Check if Web Bluetooth API is supported by the browser
  const checkBluetoothSupport = () => {
    return navigator.bluetooth !== undefined;
  };

  // Request Bluetooth devices
  const requestBluetoothDevices = async () => {
    if (!checkBluetoothSupport()) {
      setError('Web Bluetooth is not supported by your browser.');
      return;
    }

    try {
      // Request Bluetooth devices with optional services (e.g., battery_service)
      const devices = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // Accepts all Bluetooth devices
        optionalServices: ['d973f2e0-b19e-11e2-9e96-0800200c9a66'], // You can add more services if needed
      });

      // Store the found device in the state
      setDevices([devices]); // Update state with the selected device
    } catch (err) {
      setError(`Error occurred: ${err.message}`);
    }
  };

  // Handle device selection and connect
  const handleDeviceSelect = async (device) => {
    setIsConnecting(true);
    try {
      // Start the pairing process and connect to the device's GATT server
      const server = await device.gatt.connect();
      setSelectedDevice(device);
      setIsConnecting(false);
      setIsConnected(true);

      // Fetch and display the services offered by the connected device
      const services = await server.getPrimaryServices();
      console.log('Device Services:', services); // Log the services to inspect
      setDeviceServices(services);

      console.log('Getting Characteristics...');
      for (const service of services) {
        console.log('> Service: ' + service.uuid);
        const characteristics = await service.getCharacteristics();

        characteristics.forEach(async (characteristic) => {
          console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
              getSupportedProperties(characteristic));
          
              if (characteristic.properties.notify) {
                characteristic.addEventListener(
                  "characteristicvaluechanged", handle_change
                );
                await characteristic.startNotifications();
              }
        });
      } 
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
      setIsConnecting(false);
      setIsConnected(false);
    }
  };
  
  return (
    <div>
      <h1>Bluetooth Low Energy Device Connector</h1>

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
                  {isConnecting ? 'Connecting...' : 'Connect'}
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

export default BluetoothBLEConnect;
