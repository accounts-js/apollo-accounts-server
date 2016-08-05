/* eslint-disable no-param-reassign */

import Grant from 'grant-express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const accountsConfigDefault = {
  callbackUrl: '/callback',
};

// TODO Revisit parameter passing
function apolloAccounts({ webServer, accountsConfig, grantConfig, handler }) {
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

// Thank you http://stackoverflow.com/a/46181
function isEmail(email) {
  // eslint-disable-next-line
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

class Accounts {
  loginWithProvider(provider, extraction) {
    let identifier;
    let username;
    let profile;
    return extraction
      .then(res => {
        identifier = res.identifier;
        username = res.username;
        profile = res.profile;
      })
      .then(() => this.findByProvider(provider, identifier))
      .then(userId => userId || this.createUser({ provider, identifier, username, profile }));
  }
  registerUser({ user, username, email, password }) {
   // TODO Validation needed
    const hash = Accounts.hashPassword(password);
    const profile = { hash };
    return this.createUser({ profile, ...Accounts.toUsernameAndEmail({ user, username, email }) });
  }
  static toUsernameAndEmail({ user, username, email }) {
    if (user && !username && !email) {
      if (isEmail(user)) {
       // eslint-disable-next-line no-param-reassign
        email = user;
      } else {
       // eslint-disable-next-line no-param-reassign
        username = user;
      }
    }
    return { username, email };
  }
  static hashPassword(password) {
    return bcrypt.hashSync(password, 10); // TODO Should salt rounds be configurable?
  }
  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

export { Accounts };
