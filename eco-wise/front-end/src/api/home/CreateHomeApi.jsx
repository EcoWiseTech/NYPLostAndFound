import EcoWiseApi from "../APIRequest";

export const CreateHome = async (homeName, userId, rooms) => {
    try {
      // Construct the request payload
      const requestBody = {
        homeName,
        userId,
        rooms,
      };
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/home', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error creating home:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };