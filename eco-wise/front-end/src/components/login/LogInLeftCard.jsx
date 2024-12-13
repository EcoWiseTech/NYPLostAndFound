import { Box, Button, Container, Card, CardContent, CardActions, Stack, Typography, TextField, Divider, InputAdornment } from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';
import AddIcon from '@mui/icons-material/Add';
import HelpIcon from '@mui/icons-material/Help';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { Link } from "react-router-dom";
import CardTitle from "../../components/common/CardTitle";
import SmallCardTitle from "../../components/common/SmallCardTitle";
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import { Visibility, VisibilityOff } from "@mui/icons-material";

function LogInLeftCard(props) {
    const {
        formik,
        togglePasswordVisibility,
        showPassword,
        mfaCode,
        setMfaCode,
        errorMessage,
        loading,
        googleAuth,
        handleResetPasswordDialog,
        isMfaRequired,
        open,
        setOpen
    } = props
    return (
        <Card sx={{ margin: "auto" }}>

            <Box component="form" onSubmit={formik.handleSubmit}>
                <CardContent>
                    <CardTitle title="Login to EcoWise" icon={<LoginIcon color="text.secondary" />} />
                    <Stack spacing={2} sx={{ marginTop: 2 }}>
                        <TextField
                            type="email"
                            fullWidth
                            label="E-mail Address"
                            variant="outlined"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                            <TextField
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                label="Password"
                                variant="outlined"
                                name="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={togglePasswordVisibility}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                        {isMfaRequired && (
                            <Box mb={2}>
                                <TextField
                                    type="number"
                                    label="MFA Code"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <VpnKeyIcon color="primary" sx={{ marginRight: 1 }} />
                                        ),
                                    }}
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    required
                                />
                            </Box>
                        )}
                        <Collapse in={open}>
                            <Alert
                                severity="error"
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                {errorMessage}
                            </Alert>
                        </Collapse>
                    </Stack>
                </CardContent>
                <CardActions>
                    <LoadingButton type="submit" loadingPosition="start" loading={loading} size="small" variant="contained" color="primary" startIcon={<LoginIcon />}>Login</LoadingButton>
                    <Button size="small" variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/register">Register</Button>
                </CardActions>
            </Box>
            <Divider />
            <CardContent>
                <Stack spacing={1}>
                    <Button variant="outlined" color="primary" startIcon={<GoogleIcon />} fullWidth onClick={googleAuth}>Login with Google</Button>
                    <Button variant="outlined" color="primary" startIcon={<FacebookIcon />} fullWidth onClick={googleAuth}>Login with FaceBook</Button>
                    {/* <FacebookLogin
                                        appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                                        onSuccess={handleFacebookSuccess}
                                        onFail={handleFacebookFailure}
                                        render={({ onClick, logout }) => (
                                            <Button variant="outlined" color="primary" startIcon={<FacebookIcon />} onClick={onClick} fullWidth>Login with Facebook</Button>
                                        )}
                                    /> */}
                </Stack>
            </CardContent>
            <Divider />
            <CardContent>
                <SmallCardTitle title="Trouble Logging In?" icon={<HelpIcon color="text.secondary" sx={{ fontSize: '1.3rem' }} />} />
                <Typography variant="body2" sx={{ marginTop: 1, fontSize: '0.8rem' }}>
                    If you have forgotten your password, you can reset it by clicking the button below.
                </Typography>
                <Button sx={{ marginTop: 1, fontSize: "0.8rem" }} variant="outlined" color="primary" onClick={handleResetPasswordDialog}>Reset Password</Button>
            </CardContent>
        </Card>
    )
}

export default LogInLeftCard