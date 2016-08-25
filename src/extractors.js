import rp from 'request-promise';
import extendify from 'extendify';

const USER_AGENT = 'apollo-accounts-server';

const extend = extendify({
  inPlace: false,
});

const github = (config) => {
  // eslint-disable-next-line no-param-reassign
  config.extract = (accessToken, { key, secret }) =>
    rp({
      uri: 'https://api.github.com/user',
      qs: {
        access_token: accessToken,
        client_id: key,
        client_secret: secret,
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
      json: true,
    }).then(result => ({ identifier: result.id, username: result.login, profile: result }));
};

const extractors = {
  github,
};

export default (config) => {
  const newConfig = extend({}, config);
  Object.keys(newConfig)
        .forEach(provider => provider !== 'server' && extractors[provider](newConfig));
  return newConfig;
};
