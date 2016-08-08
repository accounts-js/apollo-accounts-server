import objectAssignDeep from 'object-assign-deep';
import { pick, omit } from 'lodash';
import rp from 'request-promise';
import commonConfig from './commonConfig';


export const defaultConfig = {
  server: {
    protocol: 'http',
    host: 'localhost:3000',
    callback: '/callback',
    transport: 'session',
    state: true,
    redirectTo: '/',
    ...commonConfig,
  },
  session: {
    cookieName: 'apollo-accounts',
    duration: 24 * 60 * 60 * 1000, // 1 day
    cookie: {
      httpOnly: true,
    },
  },
};

// TODO Split provider extract functions out of this one
export const addDefaultExtractors = (config) => {
  const newConfig = objectAssignDeep({}, config);
  Object.keys(newConfig).forEach(provider => {
    switch (provider) {
      case 'github': {
        newConfig[provider].extract = (accessToken, { key, secret }) =>
          rp({
            uri: 'https://api.github.com/user',
            qs: {
              access_token: accessToken,
              client_id: key,
              client_secret: secret,
            },
            headers: {
              'User-Agent': 'apollo-accounts-server',
            },
            json: true,
          }).then(result => ({ identifier: result.id, username: result.login, profile: result }));
        break;
      }
      default:
        break;
    }
  });
  return newConfig;
};

export const toGrant = (config) => {
  const newConfig = omit(config, ['session']);
  newConfig.server = pick(config.server, [
    'protocol', 'host', 'path', 'callback', 'transport', 'state',
  ]);
  Object.keys(newConfig).forEach((key) => {
    if (key !== 'server') {
      newConfig[key] = omit(newConfig[key], ['extract']);
    }
  });
  return newConfig;
};

export default (config) => addDefaultExtractors(objectAssignDeep({}, defaultConfig, config));
