import ItemApi from "../APIRequestItem";


export const StoreItemApi = async (requestBody) => {
    try {

        // Make the POST request using the APIRequest class
        const response = await ItemApi.post('/StoreItem', requestBody);

        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error Storing Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};