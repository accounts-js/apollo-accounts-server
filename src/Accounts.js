import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

// Thank you http://stackoverflow.com/a/46181
function isEmail(email) {
  // eslint-disable-next-line
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

class Accounts {
  constructor(config) {
    this.config = config;
  }
  loginWithProvider(provider, extraction) {
    let identifier;
    let username;
    let profile;
    return extraction
      .then((res) => {
        identifier = res.identifier;
        username = res.username;
        profile = res.profile;
      })
      .then(() => this.findByProvider(provider, identifier))
      .then(userId => userId || this.createUser({ provider, identifier, username, profile }))
      .then(userId => this.generateTokens(userId));
  }
  registerUser({ user, username, email, password }) {
   // TODO Validation needed
    const hash = Accounts.hashPassword(password);
    return this.createUser({ hash, ...Accounts.toUsernameAndEmail({ user, username, email }) });
  }
  async loginUser({ user, username, email, password }) {
    // TODO Validation needed
    const credentials = Accounts.toUsernameAndEmail({
      user, username, email,
    });

    let userId;

    try {
      if (credentials.username) {
        userId = await this.findByUsername(credentials.username);
      } else if (credentials.email) {
        userId = await this.findByEmail(credentials.email);
      }
    } catch (e) {
      throw new Error('User not found');
    }

    const hash = await this.findHashById(userId);

    return new Promise((resolve, reject) => {
      if (Accounts.comparePassword(password, hash)) {
        resolve(this.generateTokens(userId));
      } else {
        reject('Incorrect password');
      }
    });
  }
  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, this.config.server.secret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({}, this.config.server.secret, { expiresIn: '1h' });
    return { userId, accessToken, refreshToken };
  }
  static toUsernameAndEmail({ user, username, email }) {
    if (user && !username && !email) {
      if (isEmail(user)) {
        email = user; // eslint-disable-line no-param-reassign
        username = null; // eslint-disable-line no-param-reassign
      } else {
        username = user; // eslint-disable-line no-param-reassign
        email = null; // eslint-disable-line no-param-reassign
      }
    }
    return { username, email };
  }
  static hashPassword(password) {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }
  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

export default Accounts;
