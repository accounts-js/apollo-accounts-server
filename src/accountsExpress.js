import Grant from 'grant-express';
import session from 'express-session';
import { getGrantConfig } from './config';
import {
  generateTokens,
  verifyAccessTokenMiddleware,
  refreshTokensMiddleware,
} from './tokens';

/**
* Express middleware to setup routes for signing in with providers.
*
* @param {Accounts} accounts The Accounts model specific to your data store.
*/
const accountsExpress = (accounts) => (req, res, next) => {
  const app = req.app;
  const config = accounts.config;

  // Setup middleware for verifying and refreshing tokens.
  app.use(verifyAccessTokenMiddleware(config));
  app.use(refreshTokensMiddleware(config));

  // Grant requires that a session is set.
  // We will automatically remove the session after the authentication process finishes.
  app.use(session({
    name: 'grant',
    secret: Math.random().toString(36).substring(7),
    saveUninitialized: false,
    resave: false,
  }));
  app.use(new Grant(getGrantConfig(config)));
  app.use(verifyAccessTokenMiddleware);
  app.use(refreshTokensMiddleware);
  app.get(config.server.callback, (req, res) => { // eslint-disable-line no-shadow
    const handleResult = (callback) => {
      // Destroy Grant's session
      req.session.destroy(() => {
        res.clearCookie('grant');
        callback();
      });
    };
    const { provider, response } = req.session.grant;
    accounts.loginWithProvider(provider, response)
      .then(userId => {
        handleResult(() => {
          // TODO Setting localStorage and redirecting like this seems awfully hacky.
          const { accessToken, refreshToken } = generateTokens(
            userId, config
          );
          // TODO Should the userId be set in localStorage
          // even though it's already present in the token payload?
          res.send(`
<script>
localStorage.setItem('apollo-accounts:userId', 'apollo-accounts:${userId}');
localStorage.setItem('apollo-accounts:accessToken', 'apollo-accounts:${accessToken}');
localStorage.setItem('apollo-accounts:refreshToken', 'apollo-accounts:${refreshToken}');
window.opener.location = '${config.server.onSuccessRedirect}';
window.close();
</script>`);
        });
      })
      .catch((e) => {
        handleResult(() => {
          // TODO Redirect on failure?
          res.send(`Login with ${e} failed`);
        });
      });
  });

  next();
};

export default accountsExpress;
