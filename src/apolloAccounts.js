/* eslint-disable no-param-reassign */
import Grant from 'grant-express';
import jwt from 'jsonwebtoken';
import sessions from 'client-sessions';
import serverConfig, { toGrant } from './config';

function apolloAccounts({
  webServer,
  handler,
  config,
  session = true,
}) {
  config = serverConfig(config);
  const grantConfig = toGrant(config);
  // TODO Currently only supports express, expand to support koa and hapi
  if (session) {
    webServer.use(sessions({
      cookieName: 'session', // This is the cookie used by Grant, it must be named `session`
      // TODO Don't use config.session.secret, generate our own
      secret: config.session.secret,
    }));
  }
  webServer.use(new Grant(grantConfig));
  webServer.get(config.server.callback, (req, res) => {
    // TODO Currently only transport = session is supported in the config
    // setting transport = querystring in the config will fail
    if (req.session.grant) {
      const grant = req.session.grant;
      const provider = grant.provider;
      const extraction = config[provider].extract(grant.response.access_token,
         grantConfig[provider]);
      handler.loginWithProvider(provider, extraction)
          .then(userId => {
            // TODO Revisit access token expiry time.
            // TODO Should expireIn be configurable?
            const accessToken = jwt.sign({ userId }, config.server.secret, { expiresIn: '1h' });
            const refreshToken = jwt.sign({}, config.server.secret, { expiresIn: '1h' });
            // TODO This feel extremely hacky
            // figure out how to set the token in local storage properly
            res.send(`
<script>
  localStorage.setItem('apollo-accounts:accessToken', '${accessToken}');
  localStorage.setItem('apollo-accounts:refreshToken', '${refreshToken}');
  window.opener.location = '${config.server.redirectTo}';
  window.close();
</script>`);
          })
          .catch(() => res.send(`Login with ${provider} failed`));
    }
  });
}

export default apolloAccounts;
