import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1'
});

// Initialize Cognito service provider
const cognito = new AWS.CognitoIdentityServiceProvider();

async function SignUpUserApi(email, fullName, password) {
  console.log('reached');
  try {
    const params = {
      ClientId: '2e5rh184m1r9akathdhmckttb',
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'given_name',
          Value: fullName,
        },
      ],
    };

    const data = await cognito.signUp(params).promise();
    console.log('Sign up successful:', data);
    return data; // Return the successful response
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

export default SignUpUserApi;
