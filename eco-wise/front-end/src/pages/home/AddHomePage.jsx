import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    IconButton,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { StoreHomeApi } from '../../api/home/StoreHomeApi';
import { useUserContext } from '../../contexts/UserContext';
import { useAlert } from '../../contexts/AlertContext';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';

const validationSchema = Yup.object({
    homeName: Yup.string().required('Home name is required'),
    rooms: Yup.array().of(
        Yup.object({
            name: Yup.string().required('Room name is required'),
            devices: Yup.array().of(
                Yup.object({
                    name: Yup.string().required('Device name is required'),
                })
            ),
        })
    ),
});

function AddHomePage() {
    const { user } = useUserContext();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Store initialValues in state
    const [initialValues, setInitialValues] = useState({
        homeName: '',
        rooms: [
            {
                name: '',
                devices: [{ name: '' }],
            },
        ],
    });


    const handleSubmit = (values) => {
        setLoading(true);
        const filteredValues = {
            ...values,
            userId: user.Username,
            rooms: values.rooms.filter((room) => room.name.trim() !== ''),
        };
        console.log(filteredValues);
        StoreHomeApi(filteredValues)
            .then((res) => {
                showAlert('success', 'New home has been added.');
                navigate('/dashboard');
            })
            .catch((err) => {
                showAlert('error', 'Unexpected error occurred, please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Card sx={{ width: '100%', maxWidth: 800, p: 3 }}>
                <CardContent>
                    <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
                        Add New Home
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleSubmit,
                            setFieldValue,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        label="Home Name"
                                        variant="outlined"
                                        fullWidth
                                        name="homeName"
                                        value={values.homeName}
                                        onChange={handleChange}
                                        error={touched.homeName && Boolean(errors.homeName)}
                                        helperText={touched.homeName && errors.homeName}
                                    />
                                </Box>
                                <FieldArray name="rooms">
                                    {({ push, remove }) => (
                                        <>
                                            {values.rooms.map((room, roomIndex) => (
                                                <Box
                                                    key={roomIndex}
                                                    sx={{
                                                        mb: 3,
                                                        border: '1px solid #ddd',
                                                        p: 2,
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                                                    >
                                                        <TextField
                                                            label="Room Name"
                                                            variant="outlined"
                                                            fullWidth
                                                            name={`rooms[${roomIndex}].name`}
                                                            value={room.name}
                                                            onChange={handleChange}
                                                            error={
                                                                touched.rooms &&
                                                                touched.rooms[roomIndex]?.name &&
                                                                Boolean(errors.rooms?.[roomIndex]?.name)
                                                            }
                                                            helperText={
                                                                touched.rooms &&
                                                                touched.rooms[roomIndex]?.name &&
                                                                errors.rooms?.[roomIndex]?.name
                                                            }
                                                        />
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => remove(roomIndex)}
                                                            sx={{ ml: 2 }}
                                                        >
                                                            <RemoveIcon />
                                                        </IconButton>
                                                    </Box>
                                                    <FieldArray name={`rooms[${roomIndex}].devices`}>
                                                        {({ push: pushDevice, remove: removeDevice }) => (
                                                            <>
                                                                {room.devices.map((device, deviceIndex) => (
                                                                    <Box
                                                                        key={deviceIndex}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            mb: 2,
                                                                        }}
                                                                    >
                                                                        <TextField
                                                                            label="Device Name"
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            name={`rooms[${roomIndex}].devices[${deviceIndex}].name`}
                                                                            value={device.name}
                                                                            onChange={handleChange}
                                                                            error={
                                                                                touched.rooms &&
                                                                                touched.rooms[roomIndex]?.devices?.[
                                                                                    deviceIndex
                                                                                ]?.name &&
                                                                                Boolean(
                                                                                    errors.rooms?.[roomIndex]?.devices?.[
                                                                                        deviceIndex
                                                                                    ]?.name
                                                                                )
                                                                            }
                                                                            helperText={
                                                                                touched.rooms &&
                                                                                touched.rooms[roomIndex]?.devices?.[
                                                                                    deviceIndex
                                                                                ]?.name &&
                                                                                errors.rooms?.[roomIndex]?.devices?.[
                                                                                    deviceIndex
                                                                                ]?.name
                                                                            }
                                                                        />
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() => removeDevice(deviceIndex)}
                                                                            sx={{ ml: 2 }}
                                                                        >
                                                                            <RemoveIcon />
                                                                        </IconButton>
                                                                    </Box>
                                                                ))}
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<AddIcon />}
                                                                    onClick={() =>
                                                                        pushDevice({ name: '' })
                                                                    }
                                                                    sx={{ mt: 1 }}
                                                                >
                                                                    Add Device
                                                                </Button>
                                                            </>
                                                        )}
                                                    </FieldArray>
                                                </Box>
                                            ))}
                                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() =>
                                                        push({
                                                            name: '',
                                                            devices: [{ name: '' }],
                                                        })
                                                    }
                                                >
                                                    Add Room
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                </FieldArray>
                                <Divider sx={{ mb: 3 }} />
                                <LoadingButton
                                    loading={loading}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    fullWidth
                                >
                                    Add
                                </LoadingButton>
                            </form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
}

export default AddHomePage;
