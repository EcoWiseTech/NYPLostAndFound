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
import { GetPreferenceApi } from '../../api/preference/GetPreferenceApi';
import { UpdatePreferenceApi } from '../../api/preference/UpdatePreferenceApi';
import { enqueueSnackbar } from 'notistack';
import { ModifyAllNotificationApi } from '../../api/item/ModifyAllNotificationApi';



function NotificationSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user, accessToken, refreshToken, RefreshUser, SessionRefreshError, DeleteUser } = useUserContext();
    const [formData, setFormData] = useState({
        given_name: '',
        email: '',
        birthdate: '',
    });
    const [isModified, setIsModified] = useState(false);
    const [preference, setPreference] = useState(null);
    const [allNotificationChecked, setAllNotificationChecked] = useState(user.UserAttributes['custom:allNotifications'] === 'true');
    const [categoryNotificationsChecked, setCategoryNotificationsChecked] = useState(user.UserAttributes['custom:categoryNotification']);
    const handleAllNotificationChanged = (e) => {
        console.log(e.target.checked)
        setAllNotificationChecked(e.target.checked)
        setIsModified(true);
    };
    const handleCategoryNotificationInputChange = (e) => {
        console.log(e.target.value)
        setCategoryNotificationsChecked(e.target.value)
        setIsModified(true);
    };

    const handleEditNotification = (e) => {
        setIsLoading(true);
        const reqObj = {
            email: user.UserAttributes.email,
            "custom:allNotifications": allNotificationChecked ? "true" : "false",
            "custom:categoryNotification": categoryNotificationsChecked
        };
        UpdateUserApi({ accessToken, refreshToken, attributes: reqObj })
            .then((res) => {
                RefreshUser();
                showAlert('success', "Profile Updated Successfully.");
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error updating user:", error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setIsLoading(false);
            });
        if (allNotificationChecked) {
            const requestObj = {
                email: user.UserAttributes.email,
                action: "subscribe",
                category: categoryNotificationsChecked
            }
            console.log(requestObj);
            ModifyAllNotificationApi(requestObj)
                .then((res) => {
                    console.log(res);
                })
                .catch((error) => {
                    console.error("Error subscribing user:", error);
                });
            return;
        }
        else if (!allNotificationChecked) {
            const requestObj = {
                email: user.UserAttributes.email,
                action: "unsubscribe"
            }
            ModifyAllNotificationApi(requestObj)
                .then((res) => {
                    console.log(res);
                })
                .catch((error) => {
                    console.error("Error unsubscribing user:", error);
                });
            return;
        }

    };




    return (
        <Stack direction="column" spacing={2}>
            <NotificationInformationCard
                allNotificationChecked={allNotificationChecked}
                handleAllNotificationInputChange={handleAllNotificationChanged}
                isLoading={isLoading}
                handleEditNotification={handleEditNotification}
                isModified={isModified}
                handleCategoryNotificationInputChange={handleCategoryNotificationInputChange}
                categoryNotificationsChecked={categoryNotificationsChecked}
            />

        </Stack>
    );
}

export default NotificationSettingsPage;
