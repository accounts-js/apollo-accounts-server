import rp from 'request-promise';
import extendify from 'extendify';

const USER_AGENT = 'apollo-accounts-server';

const extend = extendify({
  inPlace: false,
});

const github = ({ access_token }, { key, secret }) =>
    rp({
      uri: 'https://api.github.com/user',
      qs: {
        access_token,
        client_id: key,
        client_secret: secret,
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
      json: true,
    }).then(result => ({ identifier: result.id, username: result.login, profile: result }));

const defaultExtractors = {
  github,
};

export default (config) => {
  const newConfig = extend({}, config);
  Object.keys(newConfig)
        .forEach(provider => {
          // If the provider doesn't have an extractor function provided in the config
          // try to add a default extractor using the defaults.
          if (provider !== 'server' && !newConfig[provider].extractor
            && {}.hasOwnProperty.call(defaultExtractors, provider)) {
            newConfig[provider].extractor = defaultExtractors[provider];
          }
        });
  return newConfig;
};
