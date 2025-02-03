import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid"; // UUID for unique IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const tableName = "ItemTable";
const bucketName = "nyp-lost-and-found-us-east-1-783764587062"; // Replace with your actual S3 bucket name

// Function to upload image to S3
const uploadImageToS3 = async (image) => {
  console.log("Starting S3 upload process...");

  try {
    if (!image || !image.filename || !image.data || !image.mimetype) {
      throw new Error("Invalid image data provided.");
    }

    console.log(`Image details: Filename=${image.filename}, MIME Type=${image.mimetype}`);

    const imageUuid = uuidv4();

    // Log Base64 data size for debugging
    console.log(`Base64 image size: ${image.data.length} characters`);

    // Check if data is a Buffer; if not, convert it from Base64
    const buffer = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data, "base64");

    console.log(`Converted image buffer size: ${buffer.length} bytes`);

    const params = {
      Bucket: bucketName,
      Key: `images/${imageUuid}_${image.filename}`,
      Body: buffer,
      ContentType: image.mimetype,
    };

    console.log(`Uploading image to S3 with params: ${JSON.stringify({ Bucket: params.Bucket, Key: params.Key })}`);

    const uploadResult = await s3.upload(params).promise();

    console.log("S3 upload successful:", JSON.stringify(uploadResult, null, 2));

    return uploadResult.Location;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw new Error("Failed to upload image to S3.");
  }
};

// Function to get item by id from DynamoDB
const getItemFromDynamoDB = async (itemId) => {
  console.log("Fetching item data from DynamoDB...");

  try {
    const params = {
      TableName: tableName,
      Key: {
        id: itemId,
      },
    };

    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      throw new Error("Item not found.");
    }

    return result.Item;
  } catch (error) {
    console.error("Error fetching item from DynamoDB:", error);
    throw new Error("Failed to fetch item from DynamoDB.");
  }
};

// Function to update item data in DynamoDB
const updateItemDataInDynamoDB = async (itemId, updatedData) => {
  console.log("Updating item data in DynamoDB...");

  try {
    const params = {
      TableName: tableName,
      Key: {
        id: itemId,
      },
      UpdateExpression: "set #name = :name, #description = :description, #status = :status, #imageUrl = :imageUrl, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#description": "description",
        "#status": "status",
        "#imageUrl": "imageUrl",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": updatedData.name,
        ":description": updatedData.description,
        ":status": updatedData.status,
        ":imageUrl": updatedData.imageUrl,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDB.update(params).promise();

    console.log("Successfully updated item in DynamoDB:", result.Attributes);

    return result.Attributes; // Return updated item
  } catch (error) {
    console.error("Error updating item data in DynamoDB:", error);
    throw new Error("Failed to update item data in DynamoDB.");
  }
};

// Lambda handler
export const lambdaHandler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  let requestBody;

  try {
    requestBody = typeof event.body === "string" ? JSON.parse(event.body) : event;
  } catch (error) {
    console.error("Invalid JSON in request body:", event.body || event);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        message: "Invalid JSON format in request body.",
      }),
    };
  }

  try {
    const { id, name, description, image, status } = requestBody; // Expecting image as a file object

    console.log("Extracted request parameters:", { id, name, description, imageMetadata: image?.filename });

    // Validate input
    if (!id || !name || !description || !status) {
      console.error("Validation failed: Missing required fields.");
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required fields: id, name, description, or status.",
        }),
      };
    }

    // Fetch the existing item from DynamoDB
    const existingItem = await getItemFromDynamoDB(id);

    if (!existingItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Item not found.",
        }),
      };
    }

    // If a new image is provided, upload it to S3 and get the image URL
    let imageUrl = existingItem.imageUrl;
    if (image) {
      console.log("Uploading new image to S3...");
      imageUrl = await uploadImageToS3(image);
      console.log("New image uploaded:", imageUrl);
    }

    // Prepare updated data
    const updatedData = {
      name,
      description,
      status,
      imageUrl, // Either existing or new image URL
    };

    // Update item in DynamoDB
    const updatedItem = await updateItemDataInDynamoDB(id, updatedData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        message: "Item successfully updated.",
        itemData: updatedItem,
      }),
    };
  } catch (error) {
    console.error("Error processing update item request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while processing the request.",
        error: error.message,
      }),
    };
  }
};
