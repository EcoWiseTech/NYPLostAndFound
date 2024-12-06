const axios = require('axios').default;

export const handler = async () => {
  const options = {
    method: 'GET',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast'
  };

  try {
    const { data } = await axios.request(options);
    console.log(data);
    const response = {
      statusCode: 200,
      body: `Weather Data 2 hour: ${data}`,
    };
    return response;
  } catch (error) {
    console.error(error);
  }
};