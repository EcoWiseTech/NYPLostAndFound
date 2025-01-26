import EcoWiseApi from "../APIRequestPreference";

export const StorePreferenceApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await EcoWiseApi.post('/Preference/StorePreference', requestBody);
  
      // Return the successful response
      return response.data;
    } catch (error) {
      console.error('Error creating Preference:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };