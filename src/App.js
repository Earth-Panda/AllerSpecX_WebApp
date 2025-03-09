import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line} from "recharts";
import * as ble from "./ble.js"
import * as CONSTS from "./consts.js"
import * as serv from "./server.js"
import './App.css'
import * as ui from "./UI.js"
import image from './images/AllerSpecX_Logo.png'
import Papa from "papaparse";

const calarr = [3,116.7142857,2,0,9,46.83333333,63.83333333,0,1,0.3,1,0,1.379310345,0,12.68965517,1,385.8214286,204.2758621,35.77777778,266.6551724,3.4,2,0,6,0,123.1428571,1,1,14.44827586,1,0,341.3928571,0,16.10714286,0,8.310344828,1.413793103,3,292.2068966,69.19230769,72.83333333,4,0,5,0,304.8846154,141.3103448,10,19.65384615,28.5862069,0,2,0,2,2.1,33.53571429,0,48.79310345,0,0,4.266666667,6.793103448,1,0];
const AllerSpecX_App = () => {

  // State Holders
  const [bleStatus, updateDevice] = useState({
    error: null,
    connection: CONSTS.UNCONNECTED, // 0 is unconnected, 1 is connecting, 2 is connected
    device: null,
    services: [],
  });
  const [scan, updateScan] = useState({
    data: ui.zeroSpectra,
    status: false,
    result: "N/A",
    confidence: ui.pieData,
    weight: 0,
    nutrifax: {
      calories: 0,
      fat: 0,
      saturated_fat: 0,
      trans_fat: 0,
      carbohydrate: 0,
      fibre: 0,
      sugars: 0,
      protein: 0,
      sodium: 0,
    }
  });

  const confContRef = useRef(null);
  const specContRef = useRef(null);
  const [size, setSize] = useState({ p_width: 200, p_height: 200, g_width: 200, g_height: 200 });
  
  useEffect(() => {
    ui.updateSize(confContRef, specContRef, setSize);
    window.addEventListener("resize", ui.updateSize(confContRef, specContRef, setSize));
    return () => window.removeEventListener("resize", ui.updateSize(confContRef, specContRef, setSize));
  }, []);
  
  const [data, setData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        setData(result.data);
      },
      header: true, // Set to false if there's no header in CSV
      skipEmptyLines: true,
    });
    console.log(data)
  };

  return (
    <div class = "grid">
      {/* Display error if there's one */}
      {/* {bleStatus.error && <p style={{ color: 'red' }}>{bleStatus.error}</p>} */}

      {/* Logo/Scan Container */}
      <div class = "logo-container">
        <img class="logo-img"  src={image}/>
        {ui.connectButton(bleStatus, updateDevice)}
        {ui.scanButton(bleStatus, scan, updateScan)}
      </div>
      
      {/* Results Container */}
      <div class = "results-container">
        <div class="header" >Results</div>
        <div class="results-display">
            <div class="center-text">
              <div>{"Result: "+scan.result}</div>
            </div>
        </div>
        <div class="table-cont">
        <table class="table">
          <tr>
            <th>Calories</th>
            <td>{scan.nutrifax.calories.toFixed(2)}</td>
            <th>Fat</th>
            <td>{scan.nutrifax.fat.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Saturated Fat</th>
            <td>{scan.nutrifax.saturated_fat.toFixed(2)}</td>
            <th>Trans Fat</th>
            <td>{scan.nutrifax.trans_fat.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Carbohydrate</th>
            <td>{scan.nutrifax.carbohydrate.toFixed(2)}</td>
            <th>Fibre</th>
            <td>{scan.nutrifax.fibre.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Sugars</th>
            <td>{scan.nutrifax.sugars.toFixed(2)}</td>
            <th>Protein</th>
            <td>{scan.nutrifax.protein.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Sodium</th>
            <td>{scan.nutrifax.sodium.toFixed(2)}</td>
          </tr>
        </table>
        </div>
        

      </div>

      {/* Spectra */}
      <div class="spectra-container" ref={specContRef}>
      <button class="csv-button" onClick={ () => {ui.exportToCSV(scan.data)}}>Export to CSV</button>
        <div class="header-spectra">Spectra</div>
        
        <div class="graph">
          <ResponsiveContainer width={size.g_width} height={size.g_height}>
            {console.log(ui.arrayConvDisplay(scan.data, calarr))}
            <LineChart data={ui.arrayConvDisplay(scan.data, calarr)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" 
                label={{
                  value: "wavelength (nm)",
                  style: { textAnchor: 'middle' },
                  position: 'bottom',
                  offset: 0,
                }} 
                interval={5}/>
              <YAxis label={{
                value: "reflectance",
                style: { textAnchor: 'middle' },
                angle: -90,
                position: 'left',
                offset: 0,
              }}/>
              <Line type="monotone" dataKey="calRice" stroke="red" strokeWidth={3} dot={{ r: 0 }} />
              <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={{ r: 0 }} />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#82ca9d" stopOpacity={1} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence */}
      <div class="confidence-container" ref={confContRef}>
        <div class="header">Confidence</div>
        <div class="pie">
          <PieChart width={size.p_width} height={size.p_height}>
            <Pie
              data={scan.confidence}
              outerRadius={"100%"}
              dataKey="value"
              stroke="transparent"
              label={({name, value}) => `${name} ${value}%`}
            >
              {scan.confidence.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ui.colors[index % ui.colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>

      {/* weight */}
      <div class="weight-container">
        <div class="header">Weight (g)</div>
        <div class="weight-display">
          <div class="wieght-center-text">
            {ui.weightUpdate(scan.weight)}
          </div>  
        </div>
      </div>
    </div>
  );
};

export default AllerSpecX_App;
