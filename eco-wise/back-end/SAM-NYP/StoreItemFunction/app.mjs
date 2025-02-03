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

    if (error.requestId || error.code) {
      console.error("AWS Request ID:", error.requestId || "N/A");
      console.error("AWS Error Code:", error.code || "N/A");
      console.error("AWS Error Message:", error.message || "Unknown error");
    }

    throw new Error("Failed to upload image to S3.");
  }
};

// Function to insert data into DynamoDB
const insertItemDataIntoDynamoDB = async (itemData) => {
  console.log("Inserting item data into DynamoDB...");

  try {
    const params = {
      TableName: tableName,
      Item: itemData,
    };

    console.log(`DynamoDB Insert Params: ${JSON.stringify(params)}`);

    await dynamoDB.put(params).promise();

    console.log(`Successfully inserted item into DynamoDB: ${JSON.stringify(itemData)}`);
  } catch (error) {
    console.error("Error inserting item data into DynamoDB:", error);
    throw new Error("Failed to insert item data into DynamoDB.");
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
    const { name, description, image } = requestBody; // Expecting image as a file object

    console.log("Extracted request parameters:", { name, description, imageMetadata: image?.filename });

    // Validate input
    if (!name || !description || !image || !image.data || !image.filename || !image.mimetype) {
      console.error("Validation failed: Missing required fields.");
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing or invalid name, description, or image file in request body.",
        }),
      };
    }

    // Upload image to S3
    console.log("Uploading image to S3...");
    const imageUrl = await uploadImageToS3(image);
    console.log("Image successfully uploaded:", imageUrl);

    const itemUuid = uuidv4();

    const itemData = {
      id: itemUuid,
      name,
      description,
      imageUrl, // Store the S3 URL of the uploaded image
      createdAt: new Date().toISOString(),
    };

    // Insert into DynamoDB
    console.log("Inserting item data into DynamoDB...");
    await insertItemDataIntoDynamoDB(itemData);

    console.log("Lambda execution successful, returning response.");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        message: "Item successfully added to DynamoDB.",
        itemData,
      }),
    };
  } catch (error) {
    console.error("Error processing item data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while processing the request.",
        error: error.message,
      }),
    };
  }
};
