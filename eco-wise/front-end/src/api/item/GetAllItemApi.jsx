import ItemApi from "../APIRequestItem";


export const GetAllItemApi = async () => {
    try {

        // Make the get request using the APIRequest class
        const response = await ItemApi.get('/GetItem');

        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};