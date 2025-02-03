import ItemApi from "../APIRequestItem";


export const ModifyAllNotificationApi = async (requestBody) => {
    try {

        // Make the POST request using the APIRequest class
        const response = await ItemApi.post('/ModifyAllNotifications', requestBody);

        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error modifying notifications:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};