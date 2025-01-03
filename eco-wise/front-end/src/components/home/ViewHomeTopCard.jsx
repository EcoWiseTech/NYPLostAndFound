import { Link, useNavigate} from 'react-router-dom';
import { Box, Button, Card, CardContent,Typography } from '@mui/material';
import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';

function ViewHomeTopCard(props) {

    const {home, uuid} = props
    const navigate = useNavigate()

    return (
        <Card sx={{ mb: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '1rem' }}>
            <CardContent>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button onClick={() => navigate(-1)} >
                        <ArrowBackSharpIcon />
                    </Button>
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
    )
}

export default ViewHomeTopCard