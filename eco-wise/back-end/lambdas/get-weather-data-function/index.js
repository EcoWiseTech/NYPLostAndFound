const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = 'WeatherTable';

exports.handler = async () => {
  try {
    // Scan operation to read all items from the table
    const params = {
      TableName: tableName,
    };

    const data = await dynamoDB.scan(params).promise();

    console.log('Read data from DynamoDB:', data.Items);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully read data from DynamoDB.',
        data: data.Items,
      }),
    };
  } catch (error) {
    console.error('Error reading data from DynamoDB:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while reading data from DynamoDB.',
        error: error.message,
      }),
    };
  }
};
