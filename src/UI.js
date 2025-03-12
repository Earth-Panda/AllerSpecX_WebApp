import * as CONSTS from "./consts.js"
import * as ble from "./ble.js";
import * as serv from "./server.js";

export const pieData = [
    { name: "", value: 100 },
];

// const zeroSpectra = new Array(64).fill(0);
export const zeroSpectra = [4,152.4333333,2,0.366666667,12,63.75862069,93.7,0,2,1,1,0.366666667,4.066666667,0,16,2,515.4333333,287.4333333,29.96666667,420.8965517,72.2,3,0,8,0,308.3461538,1,2,11,2.333333333,0,345.7,0,25,0,12,20.06666667,8,401.8666667,27.17241379,122,6,0,7,1,436.2,204.6923077,15,29.12,27.56666667,0,3,0.266666667,45.9,6.966666667,53.4137931,4.1,87.77777778,0,1,11,17.48275862,0,1];

export var colors = ['#d3d3d3','#EB6130','#d3d3d3'];

export function updateSize(confContRef, specContRef, setSize) {
    if (confContRef.current) {
        const parentWidth = confContRef.current.offsetWidth;
        const parentHeight = confContRef.current.offsetHeight;
        setSize(prev => ({
          ...prev,
          p_width: parentWidth * 1, 
          p_height: parentHeight * 0.7 
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
            ble.clearData()
            setTimeout(scanClick, 12000, updateScan);
          }}>Scan Sample
      </button>)
    }
}

function scanClick(updateScan){
  // Scan / server send routine
  var data = ble.getData().map(Number);
  if (data.length == 64){
    updateScan( prev => ({
      ...prev,
      data: data,
    }));
    console.log(data);
    colors = ['#EB6130','#d3d3d3'];
    serv.sendToML(0, data, updateScan, 'http://127.0.0.1:8080/v1/models/model:predict');
    serv.sendToML(0, data, updateScan, 'http://127.0.0.1:8082/v1/models/model:predict');
    ble.clearData()
  } 
  else {
    setTimeout(scanClick, 100, updateScan);
  }
}

export function weightUpdate(weight){
  if(weight == 0){
    return("N/A")
  } else {  
    return (weight+"g")
  }
}

// Function to convert array of objects to CSV

// Function to trigger CSV file download
export function exportToCSV(data) {
  if(data.length >0){
    const csvContent = data.join(","); // Convert array to a single CSV row
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
