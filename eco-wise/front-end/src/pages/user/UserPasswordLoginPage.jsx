import { Box, Button, Card, CardContent, Divider, Grid, Typography } from '@mui/material'
import React from 'react'
import CardTitle from '../../components/common/CardTitle'
import AddLinkIcon from '@mui/icons-material/AddLink';
import UserSocialLoginCard from '../../components/user/UserSocialLoginCard';
import UnlinkUserSSOApi from '../../api/auth/UnlinkUserSSOApi';
import { useUserContext } from '../../contexts/UserContext';
import { useAlert } from '../../contexts/AlertContext';
import { jwtDecode } from 'jwt-decode';
import LinkUserSSOApi from '../../api/auth/LinkUserSSOApi';

function UserPasswordLoginPage() {

    const { user, RefreshUser } = useUserContext()
    const { showAlert } = useAlert()

    const getFederatedIdentitySub = (userAttributes, provider) => {
        if (!userAttributes || !userAttributes.identities) {
            return null;
        }
        // Parse the identities array
        const identities = JSON.parse(userAttributes.identities);

        const googleIdentity = identities.find(identity => identity.providerName === provider);

        if (googleIdentity) {
            return googleIdentity.userId;  // Return the Google 'sub' (user ID)
        }
        return null;
    };

    const unlinkGoogle = () => {
        const sub = getFederatedIdentitySub(user.UserAttributes, "Google")
        UnlinkUserSSOApi(sub, "Google")
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Google Account has been unlinked')
            })
            .catch((error) => {
                showAlert('error', 'An unexpected error occured, please try again.')
            })
    }

    const linkGoogle = (credentials) => {
        const { sub } = jwtDecode(credentials)
        LinkUserSSOApi(sub, "Google")
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Google Account has been linked')
            })
            .catch((error) => {
                if (error.name == "InvalidParameterException" && error.message.includes('SourceUser is already linked to DestinationUser')) {
                    return showAlert('error', 'Google Account has already been linked to another account.')
                }
                if (error.name == "InvalidParameterException" && error.message.includes('Merging is not currently supported')) {
                    return showAlert('error', 'Google Account already registered on EcoWise. Sign in with the google account and delete it first.')
                }
                showAlert('error', 'An unexpected error occured, please try again.')
            })
    }


    return (
        <>

            <UserSocialLoginCard
                unlinkGoogle={unlinkGoogle}
                linkGoogle={linkGoogle}
            />
        </>
    )
}

export default UserPasswordLoginPage