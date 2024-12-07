import React, { useEffect, useState } from 'react';
import GetWeatherDataApi from '../api/weatherApi';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

function Weatherpage() {
  const [weatherData, setWeatherData] = useState([]);

  const fetchWeatherData = async () => {
    try {
      const response = await GetWeatherDataApi();
      console.log("Weather data:", response.data);
      setWeatherData(response.data);
    } catch (error) {
      console.error("Failed to fetch weather data:", error.message);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell align="right">Timestamp</TableCell>
            <TableCell align="right">Forecast</TableCell>
            <TableCell align="right">Latitude</TableCell>
            <TableCell align="right">Longitude</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {weatherData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.Location}</TableCell>
              <TableCell align="right">{new Date(row.Timestamp).toLocaleString()}</TableCell>
              <TableCell align="right">{row.forecast}</TableCell>
              <TableCell align="right">{row.latitude}</TableCell>
              <TableCell align="right">{row.longitude}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Weatherpage;
