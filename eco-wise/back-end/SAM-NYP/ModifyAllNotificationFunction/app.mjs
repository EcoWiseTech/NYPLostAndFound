import AWS from "aws-sdk";

// Initialize SNS client
const sns = new AWS.SNS();
const snsTopicArn = "arn:aws:sns:us-east-1:783764587062:AllNotificationsTopic"; // Replace with your SNS topic ARN

export const lambdaHandler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  try {
    // Parse the request body (assuming JSON payload)
    const body = JSON.parse(event.body);
    const { email, action, category } = body;

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
      console.log("reached")
      // List subscriptions for the topic
      const listParams = {
        TopicArn: snsTopicArn,
      };
      const subscriptions = await sns.listSubscriptionsByTopic(listParams).promise();

      console.log('all subs', subscriptions)

      // Check if the email is already subscribed
      const existingSubscription = subscriptions.Subscriptions.find(
        (sub) => sub.Endpoint === email
      );

      if (existingSubscription) {
        console.log("existing sub", JSON.stringify(existingSubscription))
        // If the email is already subscribed, return the subscription ARN
        if (existingSubscription.SubscriptionArn && existingSubscription.Endpoint === email) {
          // Set filter policy only if the category is not 'all'
          if (category && category !== "all") {
            const filterPolicy = {
              category: [category]
            };
            console.log('reached here', filterPolicy)
            const setFilterParams = {
              SubscriptionArn: existingSubscription.SubscriptionArn,
              AttributeName: "FilterPolicy",  // Corrected here
              AttributeValue: JSON.stringify(filterPolicy),  // Stringify the filter policy
            };

            // Set the filter policy for the existing subscription
            const filterRes = await sns.setSubscriptionAttributes(setFilterParams).promise()
            console.log('filter result', filterRes)
            console.log(`Filter policy set for ${email}: ${JSON.stringify(filterPolicy)}`);
          } else {
            // Remove the filter policy if category is 'all'
            const removeFilterParams = {
              SubscriptionArn: existingSubscription.SubscriptionArn,
              AttributeName: "FilterPolicy",  // Corrected here
              AttributeValue: ""  // Set empty string to remove filter policy
            };

            await sns.setSubscriptionAttributes(removeFilterParams).promise();
            console.log(`Filter policy removed for ${email}`);
          }

          return {
            statusCode: 200,
            body: JSON.stringify({
              message: `${email} is already subscribed.`,
              subscriptionArn: existingSubscription.SubscriptionArn,
            }),
          };
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: `Subscription for ${email} is not confirmed.`,
            }),
          };
        }
      }

      // If the email is not subscribed, proceed with subscribing
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
          subscriptionResult: result,
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
