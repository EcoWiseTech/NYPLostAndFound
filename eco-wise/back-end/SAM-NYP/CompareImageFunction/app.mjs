import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid"; // UUID for unique IDs

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

const BUCKET_NAME = "nyp-lost-and-found-us-east-1-783764587062";

/**
 * Detect labels in an image using AWS Rekognition.
 */
const detectLabels = async (imageBuffer) => {
  const params = {
    Image: { Bytes: imageBuffer },
    MaxLabels: 10,
    MinConfidence: 70,
  };

  try {
    const response = await rekognition.detectLabels(params).promise();
    return response.Labels.map(label => label.Name); // Return label names only
  } catch (error) {
    console.error("Error detecting labels:", error);
    throw new Error("Failed to detect labels.");
  }
};

/**
 * Fetch image buffer from S3.
 */
const getS3ObjectBuffer = async (key) => {
  try {
    const data = await s3.getObject({ Bucket: BUCKET_NAME, Key: key }).promise();
    return data.Body;
  } catch (error) {
    console.error(`Error fetching image from S3 (Key: ${key}):`, error);
    throw new Error("Failed to fetch image from S3.");
  }
};

/**
 * List all items in the S3 bucket under the "images/" prefix.
 */
const listItemsInS3 = async () => {
  try {
    const s3Objects = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: "images/" }).promise();
    return s3Objects.Contents || []; // Return an empty array if no items
  } catch (error) {
    console.error("Error listing S3 items:", error);
    throw new Error("Failed to list images from S3.");
  }
};

/**
 * Main Lambda handler function.
 */
export const lambdaHandler = async (event) => {
  try {
    const { base64Image } = JSON.parse(event.body);
    if (!base64Image) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing base64 image" }) };
    }

    const buffer = Buffer.from(base64Image, "base64");
    const uploadedItemLabels = await detectLabels(buffer);

    // List stored images in S3
    const storedItems = await listItemsInS3();
    if (storedItems.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "No stored images to compare.", results: [] }) };
    }

    const compareResults = await Promise.all(
      storedItems.map(async (item) => {
        try {
          const itemImageBuffer = await getS3ObjectBuffer(item.Key);
          const storedItemLabels = await detectLabels(itemImageBuffer);

          // Find common labels
          const matchingLabels = uploadedItemLabels.filter(label => storedItemLabels.includes(label));

          return {
            image: item.Key,
            match: matchingLabels.length > 0,
            matchingLabels,
          };
        } catch (error) {
          console.error(`Error processing image ${item.Key}:`, error);
          return { image: item.Key, match: false, error: error.message };
        }
      })
    );

    return { statusCode: 200, body: JSON.stringify({ results: compareResults }) };
  } catch (error) {
    console.error("Error processing image comparison:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal Server Error", error: error.message }) };
  }
};
