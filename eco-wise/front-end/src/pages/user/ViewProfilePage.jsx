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
import { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../css/PhoneInput.css'
import ProfileInformationCard from '../../components/user/ProfileInformationCard';

// Define the validation schema with yup
const schema = yup.object({
    given_name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone_number: yup
        .string()
        // .required("Phone number is requred")
        .test(
            'is-valid-phone',
            'Phone number is invalid',
            (value) => !value || isValidPhoneNumber(value)
        ),
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
            phone_number: formData.phone_number ? formData.phone_number : "",
            birthdate: formData.birthdate ? formData.birthdate : "",
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
            <ProfileInformationCard
                formData={formData}
                handleInputChange={handleInputChange}
                handlePhoneChange={handlePhoneChange}
                handleFileChange={handleFileChange}
                handleEditProfile={handleEditProfile}
                errors={errors}
                isLoading={isLoading}
                isModified={isModified}
                selectedFile={selectedFile}
                user={user}
            />
        </Stack>
    );
}

export default ViewProfilePage;
