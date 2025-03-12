import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line} from "recharts";
import * as ble from "./ble.js"
import * as CONSTS from "./consts.js"
import * as serv from "./server.js"
import './App.css'
import * as ui from "./UI.js"
import image from './images/AllerSpecX_Logo.png'
import Papa from "papaparse";

const AllerSpecX_App = () => {

  // State Holders
  const [bleStatus, updateDevice] = useState({
    error: null,
    connection: CONSTS.UNCONNECTED, // 0 is unconnected, 1 is connecting, 2 is connected
    device: null,
    services: [],
    onepack: false,
  });
  const [scan, updateScan] = useState({
    data: ui.zeroSpectra,
    status: false,
    result: "N/A",
    confidence: ui.pieData,
    weight: 0,
    nutrifax: {
      calories: 0,
      carbohydrates: 0,
      fibres: 0,
      proteins: 0,
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
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
      </div>

      {/* Spectra */}
      <div class="spectra-container" ref={specContRef}>
      <button class="csv-button" onClick={ () => {ui.exportToCSV(scan.data)}}>Export to CSV</button>
        <div class="header-spectra">Spectra</div>
        
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
              labelLine={false}
              label={renderCustomizedLabel}
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
        <div class="header">Nutrition</div>
        <div class="table-cont">
          <table class="table">
            <tr>
              <th>Calories (g)</th>
              <td>{scan.nutrifax.calories.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Carbohydrate (g)</th>
              <td>{scan.nutrifax.carbohydrates.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Fibre (g)</th>
              <td>{scan.nutrifax.fibres.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Protein (g)</th>
              <td>{scan.nutrifax.proteins.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllerSpecX_App;
