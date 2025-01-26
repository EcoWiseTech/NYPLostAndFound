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
import NotificationInformationCard from '../../components/user/NotificationInformationCard';
import DeleteUserCard from '../../components/user/DeleteUserCard';
import DeleteUserApi from '../../api/auth/DeleteUserApi';

// Define the validation schema with yup
const schema = yup.object({
    given_name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email address").required("Email is required"),
}).required();

function NotificationSettingsPage() {
    const { user, accessToken, refreshToken, RefreshUser, SessionRefreshError, DeleteUser } = useUserContext();
    const [formData, setFormData] = useState({
        given_name: '',
        email: '',
        birthdate: '',
    });
    const [isModified, setIsModified] = useState(false);
    const [notificationChecked, setNotificationChecked] = useState(false);
    const handleNotificationChanged = (e) => {
        console.log(e.target.checked)
        setNotificationChecked(e.target.checked)
        setIsModified(true);
    };
    const handleEditNotification = (e) => {
        console.log('clicked handleEditNotification')
    };
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    // Populate form data from user context
    useEffect(() => {
        if (user?.UserAttributes) {
            setFormData({
                given_name: user.UserAttributes.given_name || '',
                email: user.UserAttributes.email || '',
                birthdate: user.UserAttributes.birthdate || '',
            });
        }
    }, [user]);

    

    return (
        <Stack direction="column" spacing={2}>
            <NotificationInformationCard
                notificationChecked={notificationChecked}
                handleInputChange={handleNotificationChanged}
                isLoading={isLoading}
                handleNotificationChanged={handleEditNotification}
                isModified={isModified}
            />
           
        </Stack>
    );
}

export default NotificationSettingsPage;
