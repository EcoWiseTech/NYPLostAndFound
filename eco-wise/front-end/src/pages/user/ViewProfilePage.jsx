import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Grid,
    TextField,
    Avatar,
    CardActions,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../contexts/UserContext';
import CardTitle from '../../components/common/CardTitle';
import { LoadingButton } from '@mui/lab';
import UpdateUserApi from '../../api/auth/UpdateUserApi';
import { useAlert } from "../../contexts/AlertContext";
import * as yup from 'yup';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../css/PhoneInput.css'

// Define the validation schema with yup
const schema = yup.object({
    given_name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone_number: yup
        .string()
        .required("Phone number is requred")
        .test(
            'is-valid-phone',
            'Phone number is invalid',
            (value) => !value || isValidPhoneNumber(value)
        ),
    birthdate: yup.date().nullable().typeError('Invalid date'),
}).required();

function ViewProfilePage() {
    const { user, accessToken, refreshToken, RefreshUser } = useUserContext();
    const [formData, setFormData] = useState({
        given_name: '',
        email: '',
        phone_number: '',
        birthdate: '',
    });
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    // Populate form data from user context
    useEffect(() => {
        if (user?.UserAttributes) {
            setFormData({
                given_name: user.UserAttributes.given_name || '',
                email: user.UserAttributes.email || '',
                phone_number: user.UserAttributes.phone_number || '',
                birthdate: user.UserAttributes.birthdate || '',
            });
        }
    }, [user]);

    const validateForm = async () => {
        try {
            await schema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (validationErrors) {
            const validationIssues = {};
            validationErrors.inner.forEach((err) => {
                validationIssues[err.path] = err.message;
            });
            setErrors(validationIssues);
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setIsModified(true);
    };

    const handlePhoneChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            phone_number: value,
        }));
        setIsModified(true);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(URL.createObjectURL(file));
            setIsModified(true);
        }
    };

    const handleEditProfile = async () => {
        if (!(await validateForm())) {
            return;
        }

        setIsLoading(true);

        const requestObj = {
            email: formData.email,
            given_name: formData.given_name,
            phone_number: formData.phone_number,
            birthdate: formData.birthdate,
        };

        UpdateUserApi({ accessToken, refreshToken, attributes: requestObj })
            .then((res) => {
                RefreshUser();
                showAlert('success', "Profile Updated Successfully.");
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error updating user:", error);
                if (error.name === 'InvalidRefreshTokenException') {
                    showAlert('warning', 'Session has expired. Please log in again.');
                    navigate('/login');
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setIsLoading(false);
            });

        setIsModified(false);
    };

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <CardTitle icon={<BadgeIcon />} title="Profile Information" />
                    <Grid container spacing={2} marginTop="1rem">
                        <Grid item container spacing={2} xs={12} sm={7} md={7} lg={7}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    fullWidth
                                    disabled
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    name="given_name"
                                    value={formData.given_name}
                                    onChange={handleInputChange}
                                    fullWidth
                                    error={!!errors.given_name}
                                    helperText={errors.given_name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <PhoneInput
                                    defaultCountry="SG"
                                    value={formData.phone_number}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter phone number"
                                />
                                {errors.phone_number && <p style={{ color: '#d32f2f', fontSize: "0.75rem", marginLeft: "14px" }}>{errors.phone_number}</p>}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Date of Birth"
                                    name="birthdate"
                                    type="date"
                                    value={formData.birthdate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    error={!!errors.birthdate}
                                    helperText={errors.birthdate}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={5} md={5} lg={5} textAlign="center">
                            <Avatar
                                src={selectedFile || user.profilePicture || '/default-avatar.png'}
                                alt="Profile Picture"
                                sx={{ width: 150, height: 150, margin: '0 auto' }}
                            />
                            <Box marginTop="0.5rem" marginBottom="1rem">
                                <Typography variant="h8" color="black">
                                    Profile Picture
                                </Typography>
                            </Box>
                            <Box marginTop="1rem">
                                <Typography variant="subtitle2" color="darkgray">
                                    File Size no larger than 5MB
                                </Typography>
                            </Box>
                            <Box>
                                <LoadingButton
                                    style={{ justifyContent: 'flex-end' }}
                                    loadingPosition="start"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<FileUploadIcon />}
                                    component="label"
                                >
                                    Upload Image
                                    <input type="file" onChange={handleFileChange} hidden />
                                </LoadingButton>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ paddingX: '16px' }}>
                    <LoadingButton
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEditProfile}
                        disabled={!isModified}
                    >
                        Save
                    </LoadingButton>
                </CardActions>
            </Card>
        </Stack>
    );
}

export default ViewProfilePage;
