import objectAssignDeep from 'object-assign-deep';
import { pick } from 'lodash';
// import rp from 'request-promise';
import commonConfig from './commonConfig';

export const defaultConfig = {
  server: {
    protocol: 'http',
    host: 'dummy.com:3000',
    ...commonConfig,
  },
};

// TODO Split provider extract functions out of this one
export const addDefaultExtractors = (config) => {
  const newConfig = objectAssignDeep({}, config);
  Object.keys(newConfig).forEach((value, provider) => {
    switch (provider) {
      case 'github': {
        // newConfig[provider].extract = (accessToken, { key, secret }) =>
        //   rp({
        //     uri: 'https://api.github.com/user',
        //     qs: {
        //       access_token: accessToken,
        //       client_id: key,
        //       client_secret: secret,
        //     },
        //     headers: {
        //       'User-Agent': 'apollo-accounts',
        //     },
        //     json: true,
        //   }).then(result => ({ identifier: result.id, username: result.login, profile: result }));
        break;
      }
      default:
        break;
    }
  });
  return newConfig;
};

export const toGrant = (config) => {
  const newConfig = objectAssignDeep({}, config);
  newConfig.server = pick(config.server, [
    'protocol', 'host', 'path', 'callback', 'transport', 'state',
  ]);
  Object.keys(newConfig).forEach((value, key) => {
    if (key !== 'server') {
      newConfig[key] = pick(newConfig[key], ['extract']);
    }
  });
  return newConfig;
};

export default (config) => addDefaultExtractors(objectAssignDeep({}, defaultConfig, config));
