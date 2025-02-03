import ItemApi from "../APIRequestItem";


export const GetItemByIdApi = async (id) => {
    try {

        // Make the get request using the APIRequest class
        const response = await ItemApi.get('/GetItem' + '?itemId=' + id);

        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};