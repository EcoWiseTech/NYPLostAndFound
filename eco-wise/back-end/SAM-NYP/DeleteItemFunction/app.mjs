import AWS from 'aws-sdk';

// Initialize DynamoDB and S3 clients
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const tableName = "ItemTable";  // Your DynamoDB table name
const bucketName = "nyp-lost-and-found-us-east-1-783764587062";  // Your S3 bucket name

// Lambda function to delete items from DynamoDB and S3
export const lambdaHandler = async (event) => {
  const { itemIds } = JSON.parse(event.body);  // List of item IDs to delete

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid or missing item IDs list.",
      }),
    };
  }

  try {
    // Delete items from DynamoDB and S3 for each item ID
    for (const itemId of itemIds) {
      // Step 1: Fetch the item from DynamoDB to get the image URL
      const params = {
        TableName: tableName,
        Key: {
          id: itemId,
        },
      };

      const data = await dynamoDB.get(params).promise();

      if (!data.Item) {
        console.log(`Item with ID ${itemId} not found in DynamoDB.`);
        continue;
      }

      const imageUrl = data.Item.imageUrl;
      const fileName = imageUrl.split('/').pop(); // Extract the file name from the image URL

      // Step 2: Delete the image from S3
      const s3Params = {
        Bucket: bucketName,
        Key: `images/${fileName}`,
      };

      await s3.deleteObject(s3Params).promise();
      console.log(`Deleted image from S3: ${fileName}`);

      // Step 3: Delete the item from DynamoDB
      const deleteParams = {
        TableName: tableName,
        Key: {
          id: itemId,
        },
      };

      await dynamoDB.delete(deleteParams).promise();
      console.log(`Deleted item from DynamoDB: ${itemId}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Items successfully deleted from DynamoDB and S3.",
      }),
    };
  } catch (error) {
    console.error("Error deleting items:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to delete items from DynamoDB and S3.",
        error: error.message,
      }),
    };
  }
};
