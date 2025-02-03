import axios from 'axios';

export class APIRequest {
    constructor(baseURL) {
        // Set up base URL for your API requests
        this.apiClient = axios.create({
            baseURL: baseURL,  // Your API base URL
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers here (like Authorization token)
            },
        });
    }

    // Generic method to handle GET requests
    async get(endpoint, params = {}) {
        try {
            const response = await this.apiClient.get(endpoint, { params });
            return response
        } catch (error) {
            throw error 
        }
    }

    // Generic method to handle POST requests
    async post(endpoint, data) {
        try {
            const response = await this.apiClient.post(endpoint, data);
            return response
        } catch (error) {
            throw error
        }
    }

    // Generic method to handle PUT requests
    async put(endpoint, data) {
        try {
            const response = await this.apiClient.put(endpoint, data);
            return response
        } catch (error) {
            throw error
        }
    }

    // Generic method to handle DELETE requests
    async delete(endpoint) {
        try {
            const response = await this.apiClient.delete(endpoint);
            return response
        } catch (error) {
            throw error
        }
    }

}

const ItemApi = new APIRequest("https://akykd6z1w5.execute-api.us-east-1.amazonaws.com/Prod")

export default ItemApi;
