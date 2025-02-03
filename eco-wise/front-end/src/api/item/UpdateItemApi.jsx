import ItemApi from "../APIRequestItem";


export const UpdateItemApi = async (requestBody) => {
    try {

        // Make the POST request using the APIRequest class
        const response = await ItemApi.put('/UpdateItem', requestBody);

        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error Updating Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};