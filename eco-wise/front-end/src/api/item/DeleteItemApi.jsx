import ItemApi from "../APIRequestItem";


export const DeleteItemApi = async (requestBody) => {
    try {

        // Make the POST request using the APIRequest class
        const response = await ItemApi.post('/DeleteItem', requestBody);

        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error deleting Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};