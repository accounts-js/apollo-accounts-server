/* eslint-disable no-param-reassign */
import Grant from 'grant-express';
import jwt from 'jsonwebtoken';

const accountsConfigDefault = {
  callbackUrl: '/callback',
};

// TODO Revisit parameter passing
function apolloAccounts({ webServer, accountsConfig, grantConfig, handler }) {
  // eslint-disable-next-line no-param-reassign
  accountsConfig = Object.assign({}, accountsConfigDefault, accountsConfig);
  // TODO Currently only supports express, expand to support koa and hapi
  webServer.use(new Grant(grantConfig));
  webServer.get(accountsConfig.callbackUrl, (req, res) => {
    if (req.session.grant) {
      const grant = req.session.grant;
      const provider = grant.provider;
      const extraction = accountsConfig.providers[provider](grant.response.access_token,
         grantConfig[provider]);
      handler.loginWithProvider(provider, extraction)
          .then(userId => {
            // TODO Revisit access token expiry time.
            // TODO Should expireIn be configurable?
            const accessToken = jwt.sign({ userId }, accountsConfig.secret, { expiresIn: '1h' });
            const refreshToken = jwt.sign({}, accountsConfig.secret, { expiresIn: '1h' });

            delete req.session.grant;
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            req.session.save();

            res.end(JSON.stringify({ accessToken, refreshToken }));
          })
          .catch(err => res.end(JSON.stringify(err)));
    }
  });
}

export default apolloAccounts;
