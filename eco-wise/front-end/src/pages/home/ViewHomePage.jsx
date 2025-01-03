import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Grid} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { GetHomeApi } from '../../api/home/GetHomeApi';
import { enqueueSnackbar } from 'notistack';
import { useUserContext } from '../../contexts/UserContext';
import ViewHomeTopCard from '../../components/home/ViewHomeTopCard';
import ViewHomeRoomCard from '../../components/home/ViewHomeRoomCard';

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
                <Container maxWidth="xl" sx={{ mt: '2rem', mb:"2rem" }}>
                    <ViewHomeTopCard 
                        home={home}
                        uuid={uuid}
                    />

                    <Grid container spacing={3}>
                        {home.rooms.map((room) => (
                            <ViewHomeRoomCard 
                                room={room}
                            />
                        ))}
                    </Grid>
                </Container>
            )}
        </>
    );
}

export default ViewHomePage;
