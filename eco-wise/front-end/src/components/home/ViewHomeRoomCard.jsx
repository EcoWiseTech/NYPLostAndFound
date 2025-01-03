import { Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import DeviceIcon from '@mui/icons-material/Devices';
import CardTitle from '../../components/common/CardTitle';
import { LoadingButton } from '@mui/lab';

function ViewHomeRoomCard(props) {

    const { room } = props

    return (
        <Grid item xs={12} md={6} lg={6} key={room.roomId}>
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: '0.5rem' }}>
                        <RoomIcon color="primary" sx={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />
                        {room.roomName}
                    </Typography>
                    {room.devices.map((device, index) => (
                        <>
                            <Card sx={{ mt: 2, padding: 1.5, boxShadow: 2, }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={10}>
                                        <CardTitle
                                            title={device.model === 'Custom' ? device.customModel : device.model}
                                            icon={<DeviceIcon sx={{ color: "gray" }} />}
                                        />
                                    </Grid>
                                    <Grid item xs={2} >
                                        <LoadingButton variant='contained' color='primary'>Start</LoadingButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>Status: running {device.status}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>Type: {device.type}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {device.model === 'Custom' ? (
                                            <Typography>Model: Custom - {device.customModel}</Typography>
                                        ) :
                                            <Typography>Model: {device.model}</Typography>
                                        }
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography>Device Consumption: {device.consumption}</Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        </>

                    ))}
                </CardContent>
            </Card >
        </Grid>
    )
}

export default ViewHomeRoomCard