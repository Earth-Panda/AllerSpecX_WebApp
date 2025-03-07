import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line} from "recharts";
import * as ble from "./ble.js";
import * as CONSTS from "./consts.js"
import * as serv from "./server.js"
import './App.css';
import * as ui from "./UI.js"
import image from './images/AllerSpecX_Logo.png';

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
  });

  const confContRef = useRef(null);
  const specContRef = useRef(null);
  const [size, setSize] = useState({ p_width: 200, p_height: 200, g_width: 200, g_height: 200 });
  
  useEffect(() => {
    ui.updateSize(confContRef, specContRef, setSize);
    window.addEventListener("resize", ui.updateSize(confContRef, specContRef, setSize));
    return () => window.removeEventListener("resize", ui.updateSize(confContRef, specContRef, setSize));
  }, []);

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
              {scan.result}
            </div>
        </div>
      </div>

      {/* Spectra */}
      <div class="spectra-container" ref={specContRef}>
        <div class="header">Spectra</div>
        <div class="graph">
          <ResponsiveContainer width={size.g_width} height={size.g_height}>
            <LineChart data={ui.arrayConvDisplay(scan.data)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
              label={({name, value}) => `${name} ${value*100}%`}
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
          <div class="center-text">
            {ui.weightUpdate(scan.weight)}
          </div>  
        </div>
      </div>
    </div>
  );
};

export default AllerSpecX_App;
