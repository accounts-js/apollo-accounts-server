import bcrypt from 'bcryptjs';
import mergeConfig from './config';

const SALT_ROUNDS = 10;

// Thank you http://stackoverflow.com/a/46181
function isEmail(email) {
  // eslint-disable-next-line
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**
 * Base class for handling Account functionality.
 * This class should not be used directly and instead extended by database specific implementations.
 *
 * The child class must implement the following methods:
 *
 * createUser({ username, email, provider, identifier, profile, hash }) : Promise(userId)
 * findByUsername(username) : Promise(userId)
 * findByEmail(email) : Promise(userId)
 * findByProvider(provider, identifier) : Promise(userId)
 * findHashById(userId) : Promise(hash)
 */
class Accounts {
  constructor(config) {
    this.config = mergeConfig(config);
  }
  /**
   * Logs a user in through a specific provider.
   *
   * @param {string} provider Provider to login with. Must be defined in the config.
   * @param {Object} response The results of Grant authenticating with the provider.
   * @return {Object} tokens An object containing `userId`, 'accessToken' and 'refreshToken'.
   */
  async loginWithProvider(provider, response) {
    let userId;
    try {
      // Extract a unique identifier from the user's account under the provider
      const extraction = await this.config[provider].extractor(response, this.config[provider]);
      // Find the user id given the provider and identifier
      userId = await this.findByProvider(provider, extraction.identifier);
      // If no id was found that means this is the user's first time signing into our system.
      // We create a new account for them.
      if (!userId) {
        userId = await this.createUser({ provider, ...extraction });
      }
    } catch (e) {
      // TODO handle exception
    }

    return userId && this.generateTokens(userId);
  }
  /**
   * Registers a user.
   *
   * @param {Object} user The user's attributes.
   * @param {string} user.user Email or a username.
   * @param {string} user.username User's username.
   * @param {string} user.email User's email.
   * @param {string} user.password User's password
   * @return {Promise} promise A promise resolving to the newly created user's id.
   */
  registerUser({ user, username, email, password }) {
   // TODO Validation needed
    const hash = Accounts.hashPassword(password);
    return this.createUser({ hash, ...Accounts.toUsernameAndEmail({ user, username, email }) });
  }
  /**
   * Log in a user.
   *
   * @param {Object} user The user's attributes.
   * @param {string} user.user Email or a username.
   * @param {string} user.username User's username.
   * @param {string} user.email User's email.
   * @param {string} user.password User's password
   */
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

    if (!Accounts.comparePassword(password, hash)) {
      throw new Error('Incorrect password');
    }

    return userId;
  }
  /**
   * Given a username, user and/or email figure out the username and/or email.
   *
   * @param {Object} object An object containing at least `username`, `user` and/or `email`.
   * @return {Object} user An object containing `username` and `email`.
   */
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
  /**
   * Generate a hash for a password
   *
   * @param {string} password
   * @return {string} hash
   */
  static hashPassword(password) {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }
  /**
   * Compares a password to a hash, if the password is correct return true.
   * @param {string} password
   * @param {string} hash
   * @return {boolean} correct True if password is correct
   */
  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

export default Accounts;
