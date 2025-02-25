import * as CONSTS from "./consts.js"

export var recData = []

export function clearData() {
    recData = [];
}

export function getData(){
    return recData;
}
// Request Bluetooth devices
export async function requestBluetoothDevices(bleStatus, updateDevice) {
    console.log("Scanning for BLE devices")
    // Check if Web Bluetooth API is supported by the browser
    if (navigator.bluetooth == undefined) {
        updateDevice(prevState => ({
            ...prevState,
            error: 'Web Bluetooth is not supported by your browser.', // Update state with the selected device
        }));
        return;
    }

    try {
        // Request Bluetooth devices with the service Allersence brodcasts
        const devices = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [CONSTS.ALLERSENCE_SERVICE_UUID], // You can add more services if needed
        });

        // Store the found device in the state
        updateDevice(prevState => ({
            ...prevState,
            availableDevices: [devices], // Update state with the selected device
        }));

    } catch (err) {
        updateDevice(prevState => ({
            ...prevState,
            error: `Error occurred: ${err.message}`, // Update state with the selected device
        }));
    }
};

export function handle_change(event) {
    var enc = new TextDecoder("utf-8");
    console.log(enc.decode(event.target.value.buffer));
    recData.push(enc.decode(event.target.value.buffer))
    console.log(recData)
}

// Handle device selection and connect
export async function handleDeviceSelect(bleStatus, updateDevice) {
    updateDevice(prevState => ({
        ...prevState,
        connection: CONSTS.CONNECTING, // Set connecting 
    }));
    try {
        // Start the pairing process and connect to the device's GATT server
        const server = await bleStatus.selected.device.gatt.connect();
        
        updateDevice(prevState => ({
            ...prevState,
            connection: CONSTS.CONNECTED, // set connected
        }));

        // Fetch and display the services offered by the connected device
        const services = await server.getPrimaryServices();
        console.log('Device Services:', services); // Log the services to inspect

        updateDevice(prevState => ({
            ...prevState,
            selected: {
                ...prevState.selected,
                services: services, // Get the services
            }
        }));

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
        updateDevice(prevState => ({
            ...prevState,
            conection: CONSTS.UNCONNECTED,
            error: `Connection failed: ${err.message}`, // Update state with the selected device
        }));
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