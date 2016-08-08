/* eslint-disable no-param-reassign */
import Grant from 'grant-express';
import jwt from 'jsonwebtoken';
import sessions from 'client-sessions';
import serverConfig, { toGrant } from './config';

// TODO Revisit parameter passing
function apolloAccounts({
  webServer,
  handler,
  config }) {
  config = serverConfig(config);
  const grantConfig = toGrant(config);
  // TODO Currently only supports express, expand to support koa and hapi
  webServer.use(sessions(config.session));
  webServer.use(sessions({
    cookieName: 'session', // This is the cookie used by Grant, it must be named `session`
    secret: config.session.secret,
  }));
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
            req.session = {};
            req[config.session.cookieName].accessToken = accessToken;
            req[config.session.cookieName].refreshToken = refreshToken;
            // res.redirect(`${config.server.callback}/success`);
            res.send(`
<script>
  localStorage.setItem('apollo-accounts:accessToken', '${req[config.session.cookieName].accessToken}');
  localStorage.setItem('apollo-accounts:refreshToken', '${req[config.session.cookieName].refreshToken}');
  window.close();
</script>`);
          })
          .catch(() => res.send(`Login with ${provider} failed`));
    }
  });
  webServer.get(`${config.server.callback}/success`, (req, res) => {
    res.send(`<script>
localStorage.setItem('apollo-accounts:accessToken', '${req[config.session.cookieName].accessToken}');
localStorage.setItem('apollo-accounts:refreshToken', '${req[config.session.cookieName].refreshToken}');
window.close();
</script>`);
  });
  webServer.get(`${config.server.callback}/tokens`, (req, res) => {
    res.json(JSON.stringify({
      accessToken: req[config.session.cookieName].accessToken,
      refreshToken: req[config.session.cookieName].refreshToken }));
  });
}

export default apolloAccounts;
