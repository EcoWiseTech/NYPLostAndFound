import { Logout } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const userContext = createContext(null);

export const UserProvider = (props) => {

    const { children } = props;
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [idTokoen, setIdToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const accessTokenCheck = localStorage.getItem('accessToken');
        const idTokenCheck = localStorage.getItem('idToken');
        const refreshTokenCheck = localStorage.getItem('refreshToken');
        const userStorage = localStorage.getItem('user');
    
        // set the use state variables
        if (userStorage && accessTokenCheck && idTokenCheck && refreshTokenCheck) {
            setAccessToken(accessTokenCheck);
            setIdToken(idTokenCheck);
            setRefreshToken(refreshTokenCheck);
            setUser(JSON.parse(userStorage)); // Correctly parse the stored user object
        }
        setIsReady(true);
    }, []);
    
    // Method to populate the context use state vairables
    const UserLogIn = (userObject, accessTokenInput, idTokenInput, refreshTokenInput) => {
        // Store tokens in localStorage or secure storage
        localStorage.setItem('accessToken', accessTokenInput);
        localStorage.setItem('idToken', idTokenInput);
        localStorage.setItem('refreshToken', refreshTokenInput);
        // Set tokens in state for easy access
        setAccessToken(accessTokenInput);
        setIdToken(idTokenInput);
        setRefreshToken(refreshTokenInput);

        let formattedUserObject = userObject;
        let formatedUserAttributes = formatUserObject(userObject);
        formattedUserObject.UserAttributes = formatedUserAttributes;

        localStorage.setItem('user', JSON.stringify(formattedUserObject));
        setUser(formattedUserObject)
    }

    const formatUserObject = (userObject) => {
        if (userObject == null)
        {
            return null;
        }
        let formatedUserAttributes = {};
        userObject.UserAttributes.forEach(attribute => {
            formatedUserAttributes[attribute.Name] = attribute.Value;
        });
        return formatedUserAttributes;
    }

    const UserLogOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        setAccessToken(null);
        setIdToken(null);
        setRefreshToken(null);
        setUser(null);
    }

    const IsLoggedIn = () => {
        if (user)
            return true
        return false
    }


    return (
        <userContext.Provider
            value={{
                accessToken,
                idTokoen,
                refreshToken,
                user,
                setUser,
                UserLogIn,
                UserLogOut,
                IsLoggedIn
            }}
        >
            {isReady ? children : null}
        </userContext.Provider>
    )
}

// Custom hook to handle errors
export const useUserContext = () => {
    if (!userContext) {
        enqueueSnackbar('User context is null, please add your component within the scope of your provider')
    }
    return useContext(userContext);
}