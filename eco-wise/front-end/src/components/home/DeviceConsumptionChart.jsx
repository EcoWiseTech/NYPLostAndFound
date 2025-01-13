import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
dayjs.extend(minMax);

// Time period options
const timePeriods = {
    '30s': 30, // 30 seconds
    '1m': 60, // 1 minute
    '5m': 5 * 60, // 5 minutes
    '15m': 15 * 60, // 15 minutes
    '30m': 30 * 60, // 30 minutes
    '45m': 45 * 60, // 45 minutes
    '1h': 60 * 60, // 1 hour
    '2h': 2 * 60 * 60, // 1 hour
    '3h': 3 * 60 * 60, // 1 hour
    '4h': 4 * 60 * 60, // 1 hour
    '5h': 5 * 60 * 60, // 5 hours
    '6h': 6 * 60 * 60, // 1 hour
    '12h': 12 * 60 * 60, // 12 hours
    '1d': 24 * 60 * 60, // 1 day
    '5d': 5 * 24 * 60 * 60, // 1 day
    '15d': 15 * 24 * 60 * 60, // 1 day
    '30d': 30 * 24 * 60 * 60, // 1 day
    custom: null, // Custom time range
};

const generateTimeline = (startTime, endTime, intervalMinutes = 1) => {
    const timeline = [];
    let currentTime = dayjs(startTime);

    while (currentTime.isBefore(dayjs(endTime))) {
        timeline.push(currentTime.format('YYYY-MM-DD HH:mm'));
        currentTime = currentTime.add(intervalMinutes, 'minute');
    }
    return timeline;
};

const aggregateConsumption = (timeline, consumptionData) => {
    const aggregatedData = Array(timeline.length).fill(0);

    timeline.forEach((timeLabel, index) => {
        const currentIntervalStart = dayjs(timeLabel);
        const currentIntervalEnd = currentIntervalStart.add(1, 'minute');

        consumptionData.forEach(session => {
            const sessionStart = dayjs(session.startTime);
            const sessionEnd = dayjs(session.endTime || session.startTime);
            const totalConsumption = parseFloat(session.totalConsumption) || 0;

            // Check if the session overlaps with the current interval
            if (
                sessionStart.isBefore(currentIntervalEnd) &&
                sessionEnd.isAfter(currentIntervalStart)
            ) {
                // Calculate the overlap duration in seconds
                const overlapStart = dayjs.max(sessionStart, currentIntervalStart);
                const overlapEnd = dayjs.min(sessionEnd, currentIntervalEnd);
                const overlapDuration = overlapEnd.diff(overlapStart, 'second');

                // Total session duration in seconds
                const sessionDuration = sessionEnd.diff(sessionStart, 'second');
                
                if (sessionDuration > 0) {
                    // Distribute the consumption proportionally
                    const consumptionDuringOverlap = (totalConsumption * overlapDuration) / sessionDuration;
                    aggregatedData[index] += consumptionDuringOverlap;
                }
            }
        });
    });

    return aggregatedData;
};


const DeviceConsumptionChart = ({ toggledDevices }) => {
    const [period, setPeriod] = useState('1d'); // Default to last 24 hours
    const [customStartTime, setCustomStartTime] = useState('');
    const [customEndTime, setCustomEndTime] = useState('');

    const now = dayjs();
    const defaultStartTime = now.subtract(timePeriods[period] || 0, 'second');
    const startTime = period === 'custom' ? customStartTime : defaultStartTime.format('YYYY-MM-DD HH:mm');
    const endTime = period === 'custom' ? customEndTime : now.format('YYYY-MM-DD HH:mm');

    // Generate timeline for the selected period
    const timeline = generateTimeline(startTime, endTime);

    // Aggregate data for each device
    const datasets = toggledDevices.map(device => {
        const aggregatedData = aggregateConsumption(timeline, device.consumptionData);
        const deviceTotal = aggregatedData.reduce((sum, value) => sum + value, 0);
        return {
            label: `Device: ${device.consumptionData[0]?.customModel || device.consumptionData[0]?.model || 'Unknown'} (Total: ${deviceTotal.toFixed(2)} kW)`,
            data: aggregatedData,
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
            backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
            tension: 0.4,
        };
    });

    // Chart data
    const chartData = {
        labels: timeline,
        datasets: datasets,
    };

    // Chart options
    const options = {
        responsive: true,
        aspectRatio: 3,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Device Consumption from ${startTime} to ${endTime}`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Consumption (KW)',
                },
            },
        },
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Total Consumption: {datasets.reduce((sum, dataset) => sum + dataset.data.reduce((a, b) => a + b, 0), 0).toFixed(2)} kW
            </div>
            <label htmlFor="period">Select Time Period:</label>
            <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ marginLeft: '0.5rem', marginBottom: '1rem', padding: '0.5rem', borderRadius: '5px' }}
            >
                {Object.keys(timePeriods).map(key => (
                    <option key={key} value={key}>
                        {key.toUpperCase()}
                    </option>
                ))}
            </select>
            {period === 'custom' && (
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        Start Time:
                        <input
                            type="datetime-local"
                            value={customStartTime}
                            onChange={(e) => setCustomStartTime(e.target.value)}
                            style={{ marginLeft: '0.5rem', marginRight: '1rem', padding: '0.5rem', borderRadius: '5px' }}
                        />
                    </label>
                    <label>
                        End Time:
                        <input
                            type="datetime-local"
                            value={customEndTime}
                            onChange={(e) => setCustomEndTime(e.target.value)}
                            style={{ marginLeft: '0.5rem', padding: '0.5rem', borderRadius: '5px' }}
                        />
                    </label>
                </div>
            )}
            <div style={{ width: '100%', height: 'auto' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default DeviceConsumptionChart;
