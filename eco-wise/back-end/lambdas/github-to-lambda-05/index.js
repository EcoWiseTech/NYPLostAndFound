const axios = require('axios').default;

export const handler = async () => {
  const options = {
    method: 'GET',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
  };

  try {
    const { data } = await axios.request(options);

    // Extract and transform the data
    const areaMetadata = data.data.area_metadata;
    const forecasts = data.data.items[0]?.forecasts || [];

    // Create an array of objects with the required structure
    const transformedData = forecasts.map((forecast) => {
      const metadata = areaMetadata.find((area) => area.name === forecast.area);
      return {
        name: forecast.area,
        label_location: metadata?.label_location || {},
        forecast: forecast.forecast,
      };
    });

    console.log(transformedData);

    // Return the transformed data
    const response = {
      statusCode: 200,
      body: JSON.stringify(transformedData),
    };
    return response;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An error occurred", error: error.message }),
    };
  }
};
