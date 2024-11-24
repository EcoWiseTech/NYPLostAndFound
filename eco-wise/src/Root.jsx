import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './index.css';
import { AlertProvider } from './contexts/AlertContext';
import AlertComponenet from './components/common/Alert';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SideNav from './components/common/SideNav';
import GreyBackground from './components/common/GreyBackground';


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
                <CssBaseline />
                <AlertProvider>
                    <SideNav />
                    <AlertComponenet />
                    <Box
                        sx={{
                            minHeight: "84vh",
                            ml: 8
                        }}
                    >
                        <GreyBackground/>
                        <Outlet />
                    </Box>
                    <Footer />
                    <ScrollRestoration />

                </AlertProvider>
            </ThemeProvider>
        </>
    );
}

export default Root;