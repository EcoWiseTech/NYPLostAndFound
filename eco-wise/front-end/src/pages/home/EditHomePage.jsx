import React, { useState } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Divider,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AirConditionerIcon from '@mui/icons-material/AcUnit'; // AirCon icon
import DeviceThermostatIcon from '@mui/icons-material/DevicesOther'; // Fan icon
import HomeIcon from '@mui/icons-material/Home';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import * as Yup from 'yup';
import { useUserContext } from '../../contexts/UserContext';
import { useAlert } from '../../contexts/AlertContext';
import DevicesIcon from '@mui/icons-material/Devices';
import { useNavigate, useParams } from 'react-router-dom';
import { StoreHomeApi } from '../../api/home/StoreHomeApi';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import CardTitle from '../../components/common/CardTitle';
import { GetHomeApi } from '../../api/home/GetHomeApi';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { UpdateHomeApi } from '../../api/home/UpdateHomeApi';

const validationSchema = Yup.object({
    homeName: Yup.string().required('Home name is required'),
    rooms: Yup.array()
        .of(
            Yup.object({
                roomName: Yup.string().required('Room name is required'),
                devices: Yup.array()
                    .of(
                        Yup.object({
                            type: Yup.string().required('Device type is required'),
                            model: Yup.string().required('Device model is required'),
                            consumption: Yup.string().required('Device consumption is required'),
                        })
                    )
            })
        )
        .min(1, 'There must be at least one room'),
});

function EditHomePage() {
    const { user } = useUserContext();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [homeData, setHomeData] = useState({
        homeName: '',
        rooms: [
            {
                roomName: '',
                devices: [],
            },
        ],
    });

    const [errors, setErrors] = useState([]);
    const [openError, setOpenError] = useState(true);

    const deviceModels = {
        AirCon: ['Samsung AC 1', 'LG AC 2', 'Custom'],
        Fan: ['Dyson Fan 1', 'Philips Fan 2', 'Custom'],
    };
    const { uuid } = useParams();

    useEffect(() => {
        if (uuid) {
            GetHomeApi(user.Username, uuid)
                .then((res) => {
                    setHomeData(res.data[0]);
                    console.log(res.data[0]);
                })
                .catch((err) => {
                    enqueueSnackbar('Failed to fetch home data', { variant: 'error' });
                });
        }
    }, [user.Username, uuid]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHomeData((prev) => ({ ...prev, [name]: value }));
        setErrors([]); // Clear general error message when input is changed
    };

    const handleRoomChange = (index, field, value) => {
        const updatedRooms = [...homeData.rooms];
        updatedRooms[index][field] = value;
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
        setErrors([]); // Clear general error message when room data is changed
    };

    const handleDeviceChange = (roomIndex, deviceIndex, field, value) => {
        const updatedRooms = [...homeData.rooms];
        if (field === 'model' && value !== 'Custom') {
            updatedRooms[roomIndex].devices[deviceIndex].customModel = '';  // Clear custom model when not "Custom"
        }
        updatedRooms[roomIndex].devices[deviceIndex][field] = value;
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
        setErrors([]); // Clear general error message when device data is changed
    };


    const addRoom = () => {
        setHomeData((prev) => ({
            ...prev,
            rooms: [
                ...prev.rooms,
                { roomName: '', devices: [{ type: '', model: '', consumption: '' }] },
            ],
        }));
    };

    const removeRoom = (index) => {
        const updatedRooms = homeData.rooms.filter((_, i) => i !== index);
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
    };

    const addDevice = (roomIndex) => {
        const updatedRooms = [...homeData.rooms];
        updatedRooms[roomIndex].devices.push({ type: '', model: '', consumption: '' });
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
    };

    const removeDevice = (roomIndex, deviceIndex) => {
        const updatedRooms = [...homeData.rooms];
        updatedRooms[roomIndex].devices = updatedRooms[roomIndex].devices.filter(
            (_, i) => i !== deviceIndex
        );
        setHomeData((prev) => ({ ...prev, rooms: updatedRooms }));
    };

    const handleSubmit = async () => {
        try {
            await validationSchema.validate(homeData, { abortEarly: false });
            setLoading(true);

            const filteredData = {
                ...homeData,
                userId: user.Username,
                rooms: homeData.rooms.filter((room) => room.roomName.trim() !== ''),
            };

            await UpdateHomeApi(filteredData);
            showAlert('success', 'Home Has been Updated');
            navigate('/dashboard');
        } catch (err) {
            console.log('reached', err)
            if (err.inner) {
                // Collect all error messages into a single string
                const allErrors = err.inner.map((validationError) => validationError.message);
                setErrors(allErrors); // Store the error messages
                setOpenError(true); // Ensure the alert is open
            } else {
                showAlert('error', 'Unexpected error occurred, please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: '2rem', mb: '2rem' }}>
            {/* Display errors as collapsible alert */}
            {errors.length > 0 && (
                <Collapse in={openError}>
                    <Alert
                        sx={{ mb: 1 }}
                        severity="error"
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => setOpenError(!openError)}
                            >
                                <CloseIcon />
                            </IconButton>
                        }
                    >
                        <Box sx={{ whiteSpace: 'pre-line' }}>{errors.join(', ')}</Box>
                    </Alert>
                </Collapse>
            )}

            <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField
                    sx={{ width: '60%' }}
                    label="Home Name"
                    variant="outlined"
                    name="homeName"
                    value={homeData.homeName}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <HomeIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={addRoom} sx={{ ml: 2 }}>
                    Add Room
                </Button>
            </Card>

            <Grid container spacing={3}>
                {homeData.rooms.map((room, roomIndex) => (
                    <Grid item xs={12} md={6} key={roomIndex}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <TextField
                                        label="Room Name"
                                        variant="outlined"
                                        fullWidth
                                        value={room.roomName}
                                        onChange={(e) =>
                                            handleRoomChange(roomIndex, 'roomName', e.target.value)
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <RoomIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <IconButton color="error" onClick={() => removeRoom(roomIndex)} sx={{ ml: 2 }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                <Divider />
                                {room.devices.map((device, deviceIndex) => (
                                    <>
                                        <Card sx={{ mt: 2, padding: 1.5, boxShadow: 2, }}>
                                            <Grid container spacing={1}>
                                                <Grid item xs={11}>
                                                    <CardTitle
                                                        title='Device Settings'
                                                        icon={<DevicesIcon sx={{ color: "gray" }} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={1} >
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removeDevice(roomIndex, deviceIndex)}
                                                        sx={{
                                                            zIndex: 1, // Ensures delete icon is above other elements
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                                        <InputLabel>Device Type</InputLabel>
                                                        <Select
                                                            label='Device Type'
                                                            value={device.type}
                                                            onChange={(e) =>
                                                                handleDeviceChange(
                                                                    roomIndex,
                                                                    deviceIndex,
                                                                    'type',
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="AirCon">Air Con</MenuItem>
                                                            <MenuItem value="Fan">Fan</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    {device.type && (
                                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                                            <InputLabel>Device Model</InputLabel>
                                                            <Select
                                                                label="Device Model"
                                                                value={device.model}
                                                                onChange={(e) =>
                                                                    handleDeviceChange(
                                                                        roomIndex,
                                                                        deviceIndex,
                                                                        'model',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            >
                                                                {deviceModels[device.type].map((model) => (
                                                                    <MenuItem key={model} value={model}>
                                                                        {model}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    )}
                                                    {device.model === 'Custom' && (
                                                        <TextField
                                                            label="Custom Model Name"
                                                            variant="outlined"
                                                            fullWidth
                                                            value={device.customModel || ''}  // Use a different state variable to store the custom model
                                                            onChange={(e) =>
                                                                handleDeviceChange(
                                                                    roomIndex,
                                                                    deviceIndex,
                                                                    'customModel',  // Update customModel field
                                                                    e.target.value
                                                                )
                                                            }
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                    {device.type && device.model && (
                                                        <TextField
                                                            label="Device Consumption (e.g., 100kWh)"
                                                            variant="outlined"
                                                            fullWidth
                                                            value={device.consumption}
                                                            onChange={(e) =>
                                                                handleDeviceChange(
                                                                    roomIndex,
                                                                    deviceIndex,
                                                                    'consumption',
                                                                    e.target.value
                                                                )
                                                            }
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                </Grid>
                                            </Grid>

                                        </Card>
                                    </>
                                ))}

                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => addDevice(roomIndex)}
                                    sx={{ mt: 2 }}
                                >
                                    Add Device
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <LoadingButton
                sx={{ marginTop: '1rem' }}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                loading={loading}
            >
                Edit Home
            </LoadingButton>
        </Container>
    );
}

export default EditHomePage;
