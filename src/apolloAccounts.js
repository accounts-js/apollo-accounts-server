/* eslint-disable no-param-reassign */
import Grant from 'grant-express';
import jwt from 'jsonwebtoken';
import serverConfig, { toGrant } from './config';

// TODO Revisit parameter passing
function apolloAccounts({ webServer, handler, config }) {
  config = serverConfig(config);
  const grantConfig = toGrant(config);
  // TODO Currently only supports express, expand to support koa and hapi
  webServer.use(new Grant(grantConfig));
  webServer.get(config.server.callback, (req, res) => {
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
            delete req.session.grant;
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            req.session.save(() => {
              res.redirect(config.server.redirectTo);
            });
          })
          .catch(() => res.send(`Login with ${provider} failed`));
    }
  });
}

export default apolloAccounts;
