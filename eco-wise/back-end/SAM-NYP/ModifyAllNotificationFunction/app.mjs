import AWS from "aws-sdk";

// Initialize SNS client
const sns = new AWS.SNS();
const snsTopicArn = "arn:aws:sns:us-east-1:783764587062:LostAndFoundTopic"; // Replace with your SNS topic ARN

export const lambdaHandler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  try {
    // Parse the request body (assuming JSON payload)
    const body = JSON.parse(event.body);
    const { email, action } = body;

    if (!email || !action) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing email or action in request.",
        }),
      };
    }

    // Validate action (only "subscribe" or "unsubscribe" allowed)
    if (action !== "subscribe" && action !== "unsubscribe") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid action. Use "subscribe" or "unsubscribe".',
        }),
      };
    }

    // Handle subscription or unsubscription based on the action
    if (action === "subscribe") {
      // Subscribe the email to the SNS topic
      const subscribeParams = {
        Protocol: "email",
        Endpoint: email,
        TopicArn: snsTopicArn,
      };

      const result = await sns.subscribe(subscribeParams).promise();
      console.log("Subscription result:", result);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Subscription request sent to ${email}. Please check your inbox to confirm.`,
        }),
      };
    } else if (action === "unsubscribe") {
      // Unsubscribe the email from the SNS topic by listing subscriptions
      const listParams = {
        TopicArn: snsTopicArn,
      };

      // List subscriptions for the topic
      const subscriptions = await sns.listSubscriptionsByTopic(listParams).promise();

      // Find the subscription ARN for the email address
      const subscriptionArn = subscriptions.Subscriptions.find(
        (sub) => sub.Endpoint === email
      )?.SubscriptionArn;

      if (subscriptionArn) {
        // Unsubscribe from the topic
        const unsubscribeParams = {
          SubscriptionArn: subscriptionArn,
        };

        await sns.unsubscribe(unsubscribeParams).promise();
        console.log(`Unsubscribed ${email}`);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `${email} has been unsubscribed.`,
          }),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `No subscription found for ${email}.`,
          }),
        };
      }
    }
  } catch (error) {
    console.error("Error processing the request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while processing the request.",
        error: error.message,
      }),
    };
  }
};
