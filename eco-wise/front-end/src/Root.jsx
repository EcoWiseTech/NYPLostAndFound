import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './index.css';
import { AlertProvider } from './contexts/AlertContext';
import AlertComponenet from './components/common/Alert';
import Footer from './components/common/Footer';
import SideNav from './components/common/SideNav';
import { Navbar } from './components/common/Navbar/Navbar';
import { SnackbarProvider } from 'notistack';
import { UserProvider } from './contexts/UserContext';


const theme = createTheme({
    typography: {
        fontFamily: 'Poppins, Arial, sans-serif'
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: 'Poppins, Arial, sans-serif',
                }
            }
        }
    },
    palette: {
        primaryColor: "#001f3f"
    },
});

function Root() {
    return (
        <>
            <ThemeProvider theme={theme}>
                <UserProvider>
                    <SnackbarProvider maxSnack={3}>
                        <CssBaseline />
                        <AlertProvider>
                            <Navbar />
                            <AlertComponenet />
                            <Box
                                sx={{
                                    minHeight: "84vh",
                                }}
                            >
                                <Outlet />
                            </Box>
                            <Footer />
                            <ScrollRestoration />

                        </AlertProvider>
                    </SnackbarProvider>
                </UserProvider>
            </ThemeProvider>
        </>
    );
}

export default Root;