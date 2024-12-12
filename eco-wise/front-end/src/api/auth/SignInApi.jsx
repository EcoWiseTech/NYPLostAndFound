import {InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"; // Import SDK v3 components
import cognitoClient from "./AwsCognitoInit";

async function SignInApi(email, password) {
  try {
    // Define the parameters for the sign-in
    const params = {
      AuthFlow: process.env.REACT_APP_COGNITO_AUTH_FLOW,
      ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    // Create the command using the provided parameters
    const command = new InitiateAuthCommand(params);

    // Send the sign-in request and wait for the response
    const response = await cognitoClient.send(command);

    // Extract tokens from response
    const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

    return {
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    };
  } catch (error) {
    console.error('Error during sign-in:', error);
    throw error; // Rethrow error to be handled by the calling function
  }
}

export default SignInApi;
