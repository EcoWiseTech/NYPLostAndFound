import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1',
});

// Initialize Cognito service provider
const cognito = new AWS.CognitoIdentityServiceProvider();

async function SignInApi(email, password) {
  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH', // Auth flow for username and password
      ClientId: '2e5rh184m1r9akathdhmckttb',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const response = await cognito.initiateAuth(params).promise();
    console.log('Sign-in successful:', response);

    // Extract tokens from response
    const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
    return {
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
    };
  } catch (error) {
    console.error('Error during sign-in:', error);
    throw error; // Rethrow error to be handled by calling function
  }
}

export default SignInApi;
