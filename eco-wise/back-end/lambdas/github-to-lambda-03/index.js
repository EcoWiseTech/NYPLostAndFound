import * as lodash from 'lodash';

export const handler = async () => {
  const max = 10;
  const val = lodash.random(max);
  const response = {
    statusCode: 200,
    body: `03 new: my random value (max: ${max}): ${val}`,
  };
  return response;
};