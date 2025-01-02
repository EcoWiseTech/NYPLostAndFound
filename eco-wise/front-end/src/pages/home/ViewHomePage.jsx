import { Link, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, CircularProgress, Container, Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import DeviceIcon from '@mui/icons-material/Devices';
import { GetHomeApi } from '../../api/home/GetHomeApi';
import { enqueueSnackbar } from 'notistack';
import EditIcon from '@mui/icons-material/Edit';
import { useUserContext } from '../../contexts/UserContext';
import CardTitle from '../../components/common/CardTitle';
import { LoadingButton } from '@mui/lab';

function ViewHomePage() {
    const { user } = useUserContext();
    const [home, setHome] = useState(null);
    const { uuid } = useParams();

    useEffect(() => {
        if (uuid) {
            GetHomeApi(user.Username, uuid)
                .then((res) => {
                    setHome(res.data[0]);
                    console.log(res.data[0]);
                })
                .catch((err) => {
                    enqueueSnackbar('Failed to fetch home data', { variant: 'error' });
                });
        }
    }, [user.Username, uuid]);

    return (
        <>
            {home === null ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Container maxWidth="xl" sx={{ mt: '2rem' }}>
                    <Card sx={{ mb: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '1rem' }}>
                        <CardContent>
                            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
                                <HomeIcon sx={{ fontSize: '2rem', marginRight: '0.5rem' }} />
                                {home.homeName}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'gray', mt: '0.5rem' }}>
                                Created at: {new Date(home.createdAt).toLocaleString()}
                            </Typography>
                        </CardContent>
                        <Box>
                            <Button variant="contained" startIcon={<EditIcon />} color="primary" href='/' to={`/home/edit/${uuid}`} LinkComponent={Link}>
                                Edit
                            </Button>
                        </Box>
                    </Card>

                    <Grid container spacing={3}>
                        {home.rooms.map((room) => (
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
                                                                title={device.model === 'Custom' ? device.customModel: device.model}
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
                        ))}
                    </Grid>
                </Container>
            )}
        </>
    );
}

export default ViewHomePage;
