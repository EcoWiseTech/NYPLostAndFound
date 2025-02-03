import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "ItemTable"; // Replace with your actual table name

export const lambdaHandler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  try {
    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const itemId = queryParams.itemId;

    if (itemId) {
      console.log(`Fetching item with ID: ${itemId}`);

      // Fetch single item by ID
      const params = {
        TableName: tableName,
        Key: { id: itemId },
      };

      const result = await dynamoDB.get(params).promise();
      
      if (!result.Item) {
        console.warn(`Item with ID ${itemId} not found.`);
        return {
          statusCode: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: "Item not found." }),
        };
      }

      console.log("Item found:", JSON.stringify(result.Item));

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result.Item),
      };
    } else {
      console.log("Fetching all items...");

      // Fetch all items from the table
      const params = { TableName: tableName };
      const result = await dynamoDB.scan(params).promise();

      console.log(`Fetched ${result.Items.length} items.`);

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result.Items),
      };
    }
  } catch (error) {
    console.error("Error fetching items from DynamoDB:", error);

    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "An error occurred.", error: error.message }),
    };
  }
};
