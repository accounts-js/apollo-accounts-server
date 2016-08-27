import rp from 'request-promise';

const USER_AGENT = 'apollo-accounts-server';

export default ({ access_token }, { key, secret }) =>
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
