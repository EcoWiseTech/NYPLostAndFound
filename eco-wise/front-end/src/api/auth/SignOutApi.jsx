import { GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoClient from "./AwsCognitoInit";

async function SignOutApi(accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Access token is required to sign out.');
    }

    const params = {
      AccessToken: accessToken, // The token for the user to sign out
    };

    const command = new GlobalSignOutCommand(params);
    const response = await cognitoClient.send(command);
    
    console.log('Sign-out successful:', response);
    return response; // Return the response (can include success message)
  } catch (error) {
    console.error('Error during sign-out:', error);
    throw error; // Rethrow error for higher-level handling
  }
}

export default SignOutApi;
