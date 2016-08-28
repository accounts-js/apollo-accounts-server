import { pick, omit } from 'lodash';
import extendify from 'extendify';
import github from './extractors/github';

const extend = extendify({
  inPlace: false,
  arrays: 'replace',
});

export const defaultConfig = {
  server: {
    // Grant
    protocol: 'http',
    host: 'localhost:3000',
    callback: '/callback',
    transport: 'session',
    state: true,
    // apollo-accounts
    tokenRefreshPath: '/refresh-tokens',
    onSuccessRedirect: '/',
    loginWith: ['username', 'email'],
    signupWith: ['username', 'email'],
    openSignup: true,
    openLogin: true,
    // TODO Add default password validator
    passwordValidator: null,
    minPasswordLength: 6,
    // TODO Add default user checker
    usernameValidator: null,
    // TODO Add default email validator
    emailValidator: null,
    tokens: {
      accessToken: {
        sign: {
          expiresIn: '20m',
        },
        verify: {
        },
      },
      refreshToken: {
        sign: {
        },
        verify: {
        },
      },
    },
  },
  // Add default extractors for popular providers
  github: {
    extractor: github,
  },
};

/**
 * Given an apollo-accounts config pulls out a config which can be consumed by Grant
 */
export const getGrantConfig = (config) => {
  const grantConfig = extend({}, config);
  grantConfig.server = pick(config.server, [
    'protocol', 'host', 'path', 'callback', 'transport', 'state',
  ]);
  Object.keys(grantConfig).forEach(key => {
    if (key !== 'server') {
      grantConfig[key] = omit(grantConfig[key], ['extractor']);
    }
  });
  return grantConfig;
};

export default (config) => extend(defaultConfig, config);
