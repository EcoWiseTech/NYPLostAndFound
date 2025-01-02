import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'HomeTable';

// Function to query data from DynamoDB
const queryHomeDataFromDynamoDB = async (userId) => {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried home data for userId: ${userId}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying home data from DynamoDB:', error);
    throw new Error('Failed to query home data from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  try {
    // Extract userId from query parameters
    const userId = event.queryStringParameters && event.queryStringParameters.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required query parameter: userId.',
        }),
      };
    }

    // Query DynamoDB for home data
    const homeData = await queryHomeDataFromDynamoDB(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Home data successfully retrieved.',
        data: homeData,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
