import * as CONSTS from "./consts.js"

var recData = []
var lastScan = []
var readyToRecive = true;

export function getData(){
    return lastScan;
}

// Request Bluetooth devices
export async function bluetoothStartup(bleStatus, updateDevice) {
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
        updateDevice(prevState => ({
            ...prevState,
            connection: CONSTS.SEARCHING, // Set Scanning 
        }));
        
        // Request Bluetooth devices with the service Allersence brodcasts
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [CONSTS.ALLERSENCE_SERVICE_UUID], // You can add more services if needed
        });

        updateDevice(prevState => ({
            ...prevState,
            device: device, // Update state with the selected device
            connection: CONSTS.CONNECTING, // Set connecting 
        }));


        const server = await device.gatt.connect();

        updateDevice(prevState => ({
            ...prevState,
            connection: CONSTS.CONNECTED, // set connected
        }));

        const services = await server.getPrimaryServices();
        console.log('Device Services:', services); // Log the services to inspect

        updateDevice(prevState => ({
            ...prevState,
            services: services, // Get the services
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
            connection: CONSTS.UNCONNECTED, // Set Unconnected 
            error: `Error occurred: ${err.message}`, // Update state with the selected device
        }));
    }
};

export function handle_change(event) {
    var enc = new TextDecoder("utf-8");
    var val = enc.decode(event.target.value.buffer)
    if(val=='F'){
        readyToRecive = true
        recData = [];
    }
    else if(val=='L'){
        readyToRecive = false
        lastScan=recData
    } 
    else if(readyToRecive) {
        recData.push(val)
        // console.log(recData)
    }
    
}

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}