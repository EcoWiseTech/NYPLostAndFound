import { useEffect, useState, useContext } from 'react'
import { Box, Card, CardContent, CardActions, Typography, Button, Stack, Grid, Divider, DialogTitle, DialogContent, DialogActions, DialogContentText, Dialog, Alert, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useSnackbar } from 'notistack'
import { useGoogleLogin } from '@react-oauth/google'
import FacebookLogin from '@greatsumini/react-facebook-login';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import SecurityIcon from '@mui/icons-material/Security';
import PinIcon from '@mui/icons-material/Pin';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import CloseIcon from '@mui/icons-material/Close';
import CardTitle from '../../components/common/CardTitle'
import { useUserContext } from '../../contexts/UserContext'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../css/PhoneInput.css'
import { Link } from 'react-router-dom'
import VerifyPhoneNumberDialogModal from '../../components/common/VerifyPhoneNumberDialogModal'
import SendPhoneNumberVerificationCodeApi from '../../api/auth/SendPhoneNumberVerificationCodeApi'
import { useAlert } from '../../contexts/AlertContext'
import VerifyPhoneNumberApi from '../../api/auth/VerifyPhoneNumberApi'
import UpdateUserApi from '../../api/auth/UpdateUserApi'

function UserMFAPage() {
    const [backup, setBackup] = useState("");
    const [FAEnabled, setFAEnabled] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [showVerifyNumberDialog, setShowVerifyNumberDialog] = useState(false);
    const [showBackup, setShowBackup] = useState(false);
    const [showDisable, setShowDisable] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const { user, RefreshUser, accessToken, refreshToken, SessionRefreshError } = useUserContext();
    const [phoneNumber, setPhoneNumber] = useState(user.UserAttributes.phone_number || "");
    const [errors, setErrors] = useState('');
    const [sendCodeButtonLoading, setSendCodeButtonLoading] = useState(false);
    const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
    const [saveNumberLoading, setSaveNumberLoading] = useState(false);
    const [isPhoneInputEnabled, setIsPhoneInputEnabled] = useState(user.UserAttributes.phone_number_verified == "true" ? false : true);
    const [verificationCode, setVerificationCode] = useState('');
    const { showAlert } = useAlert();

    const handlePhoneChange = (value) => {
        setPhoneNumber(value);
    };

    const handleReEnablePhoneInput = () => {
        setIsPhoneInputEnabled(true); // Enable phone input and Save button
    };

    const sendVerificationCode = () => {
        setSendCodeButtonLoading(true);
        SendPhoneNumberVerificationCodeApi(accessToken)
            .then((res => {
                RefreshUser();
                setSendCodeButtonLoading(false);
            }))
            .catch((error) => {
                console.error('failed to send code:', error)
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                } else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setSendCodeButtonLoading(false);
            })
    }

    const verifyCode = (code) => {
        setVerifyButtonLoading(true)
        VerifyPhoneNumberApi(accessToken, code)
            .then((res) => {
                RefreshUser();
                showAlert('success', 'Phone number has been verified.')
                setVerifyButtonLoading(false);
                setShowVerifyNumberDialog(false);
                setIsPhoneInputEnabled(false);
            })
            .catch((error) => {
                console.error('failed to verify code:', error)
                if (error.name === 'NotAuthorizedException') {
                    if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
                        SessionRefreshError();
                    }
                }
                else if (error.name == "CodeMismatchException") {
                    setVerificationCode('');
                    showAlert('error', 'Invalid Code. Please try again.');
                }
                else {
                    showAlert('error', 'Unexpected error occurred. Please try again.');
                }
                setVerifyButtonLoading(false);
                setShowVerifyNumberDialog(false);
            })
    }

    const handleSavePhoneNumber = () => {
        // Logic to save the phone number, e.g., API call or update user attributes
        let inputPhoneNumber = phoneNumber == undefined ? "" : phoneNumber
        if (inputPhoneNumber == "") {
            savePhoneNumberApi(inputPhoneNumber);
        }
        else if (isValidPhoneNumber(inputPhoneNumber)) {
            savePhoneNumberApi(inputPhoneNumber);
        }
        else {
            setErrors({ phone_number: "Invalid phone_number" })
        }
    };

    const savePhoneNumberApi = (inputPhoneNumber) => {
        setSaveNumberLoading(true);
        UpdateUserApi({ accessToken, refreshToken, attributes: { "phone_number": inputPhoneNumber } })
            .then((res) => {
                RefreshUser();
                showAlert('success', "Phone number Updated Successfully.");
                setSaveNumberLoading(false)
                setErrors({})
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
                setSaveNumberLoading(false)
            })
    }


    const handleQrNext = () => {
        setShowQr(false);
        setShowBackup(true);
    }

    const handleShowBackup = () => {
        setShowBackup(true);
    }

    const handleShowDisable = () => {
        setShowDisable(true);
    }

    const check2FA = () => {
    }

    const enable2FA = () => {
        setLoading(true)
    }

    const disable2FA = () => {
        setLoading(true)
    }

    const handleVerifyNumber = () => {
        setShowVerifyNumberDialog(true)
    }

    const handleChangeGoogle = true;

    const handleFacebookFailure = (err) => {
        console.log(err);
        if (err.status === "loginCancelled") {
            enqueueSnackbar("Login failed! Cancelled by user.", { variant: "error" });
            setLoading(false);
        } else {
            enqueueSnackbar("Login failed! " + err.status, { variant: "error" });
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log('user', user.UserAttributes)
        document.title = "EnviroGo - Social Logins & 2FA"
        check2FA()
    }, [])

    return (
        <>
            <Stack direction="column" spacing={2}>
                <Card>
                    <CardContent>
                        <CardTitle icon={<SecurityIcon />} title="2-Factor Authentication" />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8} md={8} marginTop={"1rem"}>
                                <PhoneInput
                                    defaultCountry="SG"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter phone number"
                                    disabled={!isPhoneInputEnabled}
                                />

                                {errors.phone_number && (
                                    <p style={{ color: '#d32f2f', fontSize: '0.75rem', marginLeft: '14px' }}>
                                        {errors.phone_number}
                                    </p>
                                )}

                                <LoadingButton
                                    loading={saveNumberLoading}
                                    variant="contained"
                                    color="primary"
                                    disabled={!isPhoneInputEnabled}
                                    onClick={handleSavePhoneNumber} // Your function to save the phone number
                                    style={{ marginTop: '1rem', marginBottom: "0.6rem" }} // Spacing for the button
                                >
                                    Save Number
                                </LoadingButton>
                            </Grid>
                            <Grid item xs={12} sm={4} md={4} marginTop={"1rem"} marginBottom={"1rem"}>
                                {user.UserAttributes.phone_number_verified == "false" &&
                                    <Box>
                                        <Alert severity="warning">Your Number is not verified.</Alert>
                                        <Typography variant="body2" marginLeft={"0.3rem"}>
                                            Click <Link href="#" onClick={handleVerifyNumber}>here</Link> to send a verfiication code.
                                        </Typography>
                                    </Box>
                                }
                                {user.UserAttributes.phone_number_verified == "true" &&
                                    <Box>
                                        <Alert severity="success">Your Number is Verified.</Alert>
                                        <Typography variant="body2" marginLeft={"0.3rem"}>
                                            Click <Link href="#" onClick={handleReEnablePhoneInput}>here</Link> to set a new number.
                                        </Typography>
                                    </Box>
                                }
                                {!user.UserAttributes.phone_number_verified &&
                                    <Box>
                                        <Alert severity="info">Add your number.</Alert>
                                        <Typography variant="body2" marginLeft={"0.3rem"}>
                                            For 2FA to work, you need a phone number.
                                        </Typography>
                                    </Box>
                                }
                            </Grid>
                        </Grid>
                        <Divider />
                        <Box marginY={"1rem"}>
                            <Typography variant="body">
                                2-Factor Authentication (2FA) is an extra layer of security used to make sure that your account is only accessed by you. After you have enabled 2FA, you will be required to enter a unique code generated by an authenticator app on your phone, tablet or PC.
                            </Typography>
                            <br /><br />
                            <Typography variant="body">
                                This code will be required in addition to your password to log in to your account.
                            </Typography>
                            <br /><br />
                            {/* <InfoBox flexGrow={1} title="2-Factor Authentication" value={FAEnabled ? "Enabled" : "Disabled"} boolean={FAEnabled} /> */}
                        </Box>
                    </CardContent>
                    <CardActions>
                        {!FAEnabled &&
                            <LoadingButton loading={loading} variant="text" color="primary" loadingPosition='start' startIcon={<LockIcon />} onClick={enable2FA}>Enable 2FA</LoadingButton>
                        }
                        {FAEnabled &&
                            <>
                                <Button variant="text" color="primary" startIcon={<PinIcon />} onClick={handleShowBackup}>Check Backup Codes</Button>
                                <LoadingButton loading={loading} variant="text" color="primary" loadingPosition='start' startIcon={<KeyOffIcon />} onClick={handleShowDisable}>Disable 2FA</LoadingButton>
                            </>
                        }

                    </CardActions>
                </Card>
            </Stack>
            <VerifyPhoneNumberDialogModal
                open={showVerifyNumberDialog}
                setOpen={setShowVerifyNumberDialog}
                phoneNumber={phoneNumber}
                onSendCode={sendVerificationCode}
                loadingSendCode={sendCodeButtonLoading}
                onVerify={verifyCode}
                loadingVerify={verifyButtonLoading}
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
            />
            <Dialog open={showBackup} onClose={() => setShowBackup(false)}>
                <DialogTitle>Backup Code</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please save the backup code below. You will need this code to log in if you lose access to your authenticator app.
                    </DialogContentText>
                    <Box display="flex" justifyContent="center">
                        <Typography variant="h5" marginY={"1rem"}>{backup}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowBackup(false)} startIcon={<CloseIcon />}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showDisable} onClose={() => setShowDisable(false)}>
                <DialogTitle>Disable 2FA</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to disable 2FA? Your account will be less secure.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDisable(false)} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton loading={loading} loadingPosition='start' onClick={disable2FA} color="error" startIcon={<KeyOffIcon />}>Disable</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default UserMFAPage