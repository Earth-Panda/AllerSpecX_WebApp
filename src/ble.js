import * as CONSTS from "./consts.js"

// Request Bluetooth devices
export async function requestBluetoothDevices(bleStatus, updateDevice) {
    console.log("Scanning for BLE devices")
    // Check if Web Bluetooth API is supported by the browser
    if (navigator.bluetooth == undefined) {
        updateDevice({error: 'Web Bluetooth is not supported by your browser.'});
        return;
    }
    // updateDevice({error: "Ur mom"})
    try {
        // Request Bluetooth devices with the service Allersence brodcasts
        const devices = await navigator.bluetooth.requestDevice({
            filters: [ { name: "AllerSpecX"} ],
            optionalServices: [CONSTS.ALLERSENCE_SERVICE_UUID], // You can add more services if needed
        });

        // Store the found device in the state
        updateDevice({availableDevices: [devices]}); // Update state with the selected device
    } catch (err) {
        updateDevice({error: `Error occurred: ${err.message}`});
    }
};

export function handle_change(event) {
    var enc = new TextDecoder("utf-8");
    console.log(`Received Value: ${event.target.value.buffer}`);
    console.log(event)
    console.log(enc.decode(event.target.value.buffer));
}

// Handle device selection and connect
export async function handleDeviceSelect(bleStatus, updateDevice) {
    updateDevice({conection: CONSTS.CONNECTING});
    try {
        // Start the pairing process and connect to the device's GATT server
        const server = await bleStatus.selected.device.gatt.connect();
        
        updateDevice({conection: CONSTS.CONNECTED}); // set connected

        // Fetch and display the services offered by the connected device
        const services = await server.getPrimaryServices();
        console.log('Device Services:', services); // Log the services to inspect
        updateDevice({services: services});

        console.log('Getting Characteristics...');
        // for each service get the characterisitics
        for (const service of services) {
            console.log('> Service: ' + service.uuid);
            const characteristics = await service.getCharacteristics();

            // Find the notify one
            characteristics.forEach(async (characteristic) => {
                console.log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
                
                if (characteristic.properties.notify) {
                    characteristic.addEventListener("characteristicvaluechanged", handle_change);
                    await characteristic.startNotifications();
                }
            });
        } 
    } catch (err) {
        updateDevice({error: `Connection failed: ${err.message}`});
        updateDevice({conection: CONSTS.UNCONNECTED}); 
    }
  };

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}