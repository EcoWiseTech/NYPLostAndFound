import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Time period options
const timePeriods = {
    '30s': 30, // 30 seconds
    '1m': 60, // 1 minute
    '5m': 5 * 60, // 5 minutes
    '15m': 15 * 60, // 15 minutes
    '30m': 30 * 60, // 30 minutes
    '45m': 45 * 60, // 45 minutes
    '1h': 60 * 60, // 1 hour
    '5h': 5 * 60 * 60, // 5 hours
    '12h': 12 * 60 * 60, // 12 hours
    '1d': 24 * 60 * 60, // 1 day
    '5d': 5 * 24 * 60 * 60, // 5 days
    '15d': 15 * 24 * 60 * 60, // 15 days
    '30d': 30 * 24 * 60 * 60, // 30 days
    all: Infinity, // All time
};

// Helper to filter data by time period
const filterDataByPeriod = (data, periodKey) => {
    const now = dayjs();
    const periodSeconds = timePeriods[periodKey];
    if (periodSeconds === Infinity) return data;

    return data.filter(item => {
        const startTime = dayjs(item.startTime);
        return now.diff(startTime, 'second') <= periodSeconds;
    });
};

// Helper to format x-axis labels based on time period
const formatLabelForPeriod = (dateString, periodKey) => {
    const date = dayjs(dateString);
    if (periodKey === '30s' || periodKey === '1m' || periodKey === '5m' || periodKey === '15m') {
        return date.format('HH:mm:ss'); // Show hours, minutes, and seconds
    } else if (periodKey === '30m' || periodKey === '45m' || periodKey === '1h' || periodKey === '5h') {
        return date.format('HH:mm'); // Show hours and minutes
    } else if (periodKey === '12h' || periodKey === '1d' || periodKey === '5d') {
        return date.format('MMM DD HH:mm'); // Show day and time
    } else if (periodKey === '15d' || periodKey === '30d') {
        return date.format('MMM DD'); // Show day and month
    } else {
        return date.format('YYYY-MM-DD'); // Show full date for "all time"
    }
};

const DeviceConsumptionChart = ({ toggledDevices }) => {
    const [period, setPeriod] = useState('all'); // Period state

    // Filtered data for chart
    const filteredDevices = toggledDevices.map(device => ({
        ...device,
        consumptionData: filterDataByPeriod(device.consumptionData, period),
    }));

    // Calculate total consumption
    const totalConsumption = filteredDevices.reduce((sum, device) => {
        return (
            sum +
            device.consumptionData.reduce((deviceSum, session) => {
                return deviceSum + (parseFloat(session.totalConsumption) || 0);
            }, 0)
        );
    }, 0);

    // Prepare chart data
    const chartData = {
        labels: filteredDevices.flatMap(device =>
            device.consumptionData.map(data => data.startTime)
        ),
        datasets: filteredDevices.map(device => {
            // Calculate individual device total consumption
            const deviceTotal = device.consumptionData.reduce((sum, session) => {
                return sum + (parseFloat(session.totalConsumption) || 0);
            }, 0);

            return {
                label: `Device: ${device.consumptionData[0]?.customModel || device.consumptionData[0]?.model || 'Unknown'} (Total: ${deviceTotal.toFixed(2)} kWh)`, // Add total to label
                data: device.consumptionData.map(data => parseFloat(data.totalConsumption) || 0),
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
                backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
                tension: 0.4,
            };
        }),
    };

    const options = {
        responsive: true,
        aspectRatio: 3, // Set aspect ratio, 2 means width:height = 2:1
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Device Consumption Over Time',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Start Time',
                },
                ticks: {
                    callback: function (value, index, values) {
                        const dateString = chartData.labels[index];
                        return formatLabelForPeriod(dateString, period);
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Consumption (kWh)',
                },
            },
        },
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}></div>
            <div style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Total Consumption Across All Devices: {totalConsumption.toFixed(2)} kWh
            </div>
            <label htmlFor="period">Select Time Period:</label>
            <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ marginLeft: '0.5rem', marginBottom: "1rem", padding: '0.5rem', borderRadius: '5px' }}
            >
                {Object.keys(timePeriods).map((key) => (
                    <option key={key} value={key}>
                        {key === 'all' ? 'All Time' : key.toUpperCase()}
                    </option>
                ))}
            </select>
            {/* Ensure the chart takes full width and maintains aspect ratio */}
            <div style={{ width: '100%', height: 'auto' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default DeviceConsumptionChart;
