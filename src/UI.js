import * as CONSTS from "./consts.js"
import * as ble from "./ble.js";
import * as serv from "./server.js";

export const pieData = [
    { name: "", value: 1 },
];

// const zeroSpectra = new Array(64).fill(0);
export const zeroSpectra = [
  5234, 16234, 4821, 9532, 30578, 19283, 5721, 14876, 32890, 4502, 6348, 29876, 521, 12478, 36541, 21456,
  39874, 1205, 65432, 21780, 4532, 29765, 18230, 4732, 60231, 5482, 31876, 12897, 27654, 38945, 1243, 5623,
  45230, 7812, 253, 2431, 57234, 3120, 8293, 27145, 61023, 2948, 38572, 1482, 6321, 24832, 5472, 19345,
  32768, 9823, 54781, 20845, 7312, 48521, 3912, 27682, 5481, 28754, 21879, 39754, 6821, 13287, 4895, 62014
];

export const colors = ['#d3d3d3', '#00FF00', '#FF0000'];

export function updateSize(confContRef, specContRef, setSize) {
    if (confContRef.current) {
        const parentWidth = confContRef.current.offsetWidth;
        const parentHeight = confContRef.current.offsetHeight;
        setSize(prev => ({
          ...prev,
          p_width: parentWidth * 0.8, 
          p_height: parentHeight * 0.6 
        }));
      }
      if (specContRef.current) {
        const parentWidth = specContRef.current.offsetWidth;
        const parentHeight = specContRef.current.offsetHeight;
        setSize(prev => ({
          ...prev,
          g_width: parentWidth * 0.90, 
          g_height: parentHeight * 0.80
        }));
      }
}

export function arrayConvDisplay(arr) {
    const graphArr = [];
    arr.forEach((data, index) => {
        graphArr[index] = {name: 750+index*5, value: data};
    });

    return graphArr;
}

export function getStatusUI(status) {
    switch(status){
        case CONSTS.UNCONNECTED:
            return "Connect to AllerspecX device"
        case CONSTS.SEARCHING:
            return "Searching..."
        case CONSTS.CONNECTING:
            return "Connecting..."
        case CONSTS.CONNECTED:
            return "Connected"
    }
}

export function connectButton(bleStatus, updateDevice) {
  console.log(bleStatus.connection);
    if(bleStatus.connection == CONSTS.UNCONNECTED){
        return (<button 
                  class={"connect-button"}
                  onClick={ () => {
                    ble.bluetoothStartup(bleStatus, updateDevice);
                  }}>Connect to AllerSpecX Device
                </button>)
      }
      else if (bleStatus.connection == CONSTS.CONNECTING || bleStatus.connection == CONSTS.SEARCHING){
        return (<button class={"connecting-button"}>{getStatusUI(bleStatus.connection)}</button>)
      }
      else if (bleStatus.connection == CONSTS.CONNECTED){
        return (<button class={"connected-button"}>{getStatusUI(bleStatus.connection)}</button>)
      }
}

export function scanButton(bleStatus, scan, updateScan) {
    if (scan.status){
      return (<button 
          class={ "scanning-button" }
          >Scanning...
      </button>)
    }
    else if(bleStatus.connection == CONSTS.UNCONNECTED || bleStatus.connection == CONSTS.CONNECTING || bleStatus.connection == CONSTS.SEARCHING){
      return (<button 
          class={ "scan-off-button" }
          >Scan Disabled
      </button>)
    }
    else if (bleStatus.connection == CONSTS.CONNECTED){
      return (<button 
          class={ "scan-button" }
          onClick={ () => {
          
            updateScan( prev => ({
              ...prev,
              status: true,
            }));
          
            setTimeout( function() {
              // Scan / server send routine
              var data = ble.getData().map(Number);
              updateScan( prev => ({
                ...prev,
                data: data,
              }));
              console.log(data);
              serv.sendToML(0, data, updateScan);
            }, 5000);
          }}>Scan Sample
      </button>)
    }
}

export function weightUpdate(weight){
  if(weight > 0){
    return (weight+"g")
  } else {  
    return("N/A")
  }
}