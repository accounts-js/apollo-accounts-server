import Grant from 'grant-express';
import session from 'express-session';
import { getGrantConfig } from './config';

/**
* Express middleware to setup routes for signing in with providers.
*
* @param {Accounts} accounts The Accounts model specific to your data store.
*/
const accountsExpress = (accounts) => (req, res, next) => {
  const app = req.app;
  const config = accounts.config;
  // Grant requires that a session is set.
  // We will automatically remove the session after the authentication process finishes.
  app.use(session({
    name: 'grant',
    secret: Math.random().toString(36).substring(7),
    saveUninitialized: false,
    resave: false,
  }));
  app.use(new Grant(getGrantConfig(config)));
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
      .then(({ userId, accessToken, refreshToken }) => {
        handleResult(() => {
          // TODO Setting localStorage and redirecting like this seems awfully hacky.
          res.send(`
<script>
localStorage.setItem('apollo-accounts:userId', '${userId}');
localStorage.setItem('apollo-accounts:accessToken', '${accessToken}');
localStorage.setItem('apollo-accounts:refreshToken', '${refreshToken}');
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
