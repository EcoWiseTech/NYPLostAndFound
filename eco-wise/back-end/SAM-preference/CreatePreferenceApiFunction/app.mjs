import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'PreferenceTable';

// Function to insert data into DynamoDB
const insertPreferenceDataIntoDynamoDB = async (preferenceData) => {
  try {
    const params = {
      TableName: tableName,
      Item: preferenceData,
    };

    await dynamoDB.put(params).promise();
    console.log(`Inserted preference data into DynamoDB: ${JSON.stringify(preferenceData)}`);
  } catch (error) {
    console.error('Error inserting preference data into DynamoDB:', error);
    throw new Error('Failed to insert preference data into DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.preferenceName ? event : JSON.parse(event.body);
  } catch (error) {
    console.error('Invalid JSON in event or event.body:', event.body || event);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const { preferenceName, userId, rooms } = requestBody;

    // Validate input
    if (!preferenceName || !userId || !Array.isArray(rooms)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing or invalid preferenceName, userId, or rooms in request body.',
        }),
      };
    }

    // Generate UUID for preference and process rooms
    const preferenceUuid = uuidv4();
    const roomData = rooms
      .filter((room) => room.name?.trim()) // Skip empty rooms
      .map((room) => ({
        roomId: uuidv4(),
        roomName: room.name,
        devices: (room.devices || []).map((device) => ({
          ...device,
          status: "stopped",
          startTime:"",
          sessionId:"",
          deviceId: uuidv4(), // Assign a unique deviceId to each device
        })),
      }));

    const preferenceData = {
      uuid: preferenceUuid,
      userId,
      preferenceName,
      rooms: roomData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into DynamoDB
    await insertPreferenceDataIntoDynamoDB(preferenceData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Preference data successfully created and stored in DynamoDB.',
        preferenceData,
      }),
    };
  } catch (error) {
    console.error('Error processing preference data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
