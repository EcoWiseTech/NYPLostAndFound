import AWS from 'aws-sdk';

AWS.config.update({
    region: 'us-east-1',
});

// Initialize Cognito service provider
const cognito = new AWS.CognitoIdentityServiceProvider();

async function ResendAuthCodeApi(email) {
    console.log('reached')
    try {
        const params = {
            ClientId: '2e5rh184m1r9akathdhmckttb',
            Username: email,
        };

        const response = await cognito.resendConfirmationCode(params).promise();
        console.log('Confirmation code resent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error resending confirmation code:', error);
        throw error
    }
}

export default ResendAuthCodeApi;
