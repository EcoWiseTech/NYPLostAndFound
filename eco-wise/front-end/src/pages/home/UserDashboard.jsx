import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import HomeIcon from '@mui/icons-material/Home';
import ThermostatIcon from '@mui/icons-material/Thermostat';

const homes = [
    {
        id: 1,
        name: 'Home 1',
        totalEnergy: '120 kWh',
        activeDevices: 3,
        cost: '$45.00',
    },
    {
        id: 2,
        name: 'Home 2',
        totalEnergy: '80 kWh',
        activeDevices: 2,
        cost: '$30.00',
    },
];

function UserDashboard() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Energy Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
<Card>
    Stats of total houses
</Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    {homes.map((home) => (
                        <Grid item xs={12} sm={6} md={4} key={home.id}>
                            <Card sx={{ boxShadow: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <HomeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                                        <Typography variant="h6">{home.name}</Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <ElectricBoltIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                        Total Energy: {home.totalEnergy}
                                    </Typography>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <ThermostatIcon sx={{ mr: 1, color: 'info.main' }} />
                                        Active Devices: {home.activeDevices}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        Cost: {home.cost}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Grid>
        </Box>
    );
}

export default UserDashboard;
