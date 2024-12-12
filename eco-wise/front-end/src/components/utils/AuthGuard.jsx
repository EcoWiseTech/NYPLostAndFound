import { useUserContext } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";

const AuthGuard = (props) => {
    const { children, type } = props;
    const navigate = useNavigate();
    const { IsLoggedIn } = useUserContext();
    const [redirected, setRedirected] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (type === 1 && !IsLoggedIn() && !redirected) {
            console.log('reached', redirected);
            navigate('/login');
            setRedirected(true);  // update redirected status after redirection
            showAlert('warning', 'You have to be logged in to access this page. Please log in first.')
        }
    }, [redirected, IsLoggedIn, navigate, type]);  // added redirected as a dependency

    // Avoid rendering children if not logged in
    if (!IsLoggedIn()) {
        return null;
    }

    return children;
};

export default AuthGuard;
