import bcrypt from 'bcryptjs';

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
        // eslint-disable-next-line no-param-reassign
        username = null;
      } else {
        // eslint-disable-next-line no-param-reassign
        username = user;
        // eslint-disable-next-line no-param-reassign
        email = null;
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

export default Accounts;
