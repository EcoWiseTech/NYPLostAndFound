import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

// Initialize the Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-east-1'
});

export default cognitoClient;
