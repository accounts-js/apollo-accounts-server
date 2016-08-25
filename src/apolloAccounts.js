import Grant from 'grant-express';
import sessions from 'client-sessions';
import serverConfig, { getGrantConfig } from './config';
import Accounts from './Accounts';

function apolloAccounts({
  webServer,
  model,
  config,
  session = false,
}) {
  const apolloAccountsConfig = serverConfig(config);
  const grantConfig = getGrantConfig(apolloAccountsConfig);
  const modelInstance = model(apolloAccountsConfig);

  // TODO Is it possible to just use query strings rather than session?
  if (!session) {
    webServer.use(sessions({
      cookieName: 'session', // This is the cookie used by Grant, it must be named `session`
      secret: Math.random().toString(36).substring(7),
    }));
  }

  webServer.use(new Grant(grantConfig));

  webServer.get(apolloAccountsConfig.server.callback, (req, res) => {
    // TODO Currently only transport = session is supported in the config
    // setting transport = querystring in the config will fail
    if (req.session.grant) {
      const grant = req.session.grant;
      const provider = grant.provider;
      const extraction = apolloAccountsConfig[provider].extract(grant.response.access_token,
         grantConfig[provider]);
      modelInstance.loginWithProvider(provider, extraction)
          .then(userId => {
            const { accessToken, refreshToken } = Accounts.generateTokens(userId);
            res.send(`
<script>
  localStorage.setItem('apollo-accounts:accessToken', '${accessToken}');
  localStorage.setItem('apollo-accounts:refreshToken', '${refreshToken}');
  window.opener.location = '${apolloAccountsConfig.server.redirectTo}';
  window.close();
</script>`);
          })
          .catch(() => res.send(`Login with ${provider} failed`));
    }
  });

  return modelInstance;
}

export default apolloAccounts;
