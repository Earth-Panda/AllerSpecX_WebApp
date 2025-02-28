export const ALLERSENCE_SERVICE_UUID = 'd973f2e0-b19e-11e2-9e96-0800200c9a66'
export const UNCONNECTED = 0;
export const SEARCHING = 1;
export const CONNECTING = 2;
export const CONNECTED = 3;

export function getStatusUI(status) {
    switch(status){
        case UNCONNECTED:
            return "Connect"
        case SEARCHING:
            return "Searching..."
        case CONNECTING:
            return "Connecting..."
        case CONNECTED:
            return "Connected"
    }
}