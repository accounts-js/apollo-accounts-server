import { isEmpty, isObject, isArray, isFunction } from 'lodash';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Thank you http://stackoverflow.com/a/46181
function isEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export class Accounts {
  constructor(config = {}) {
    if (this.constructor === Accounts) {
      throw new TypeError('Abstract class "Accounts" cannot be instantiated directly.');
    }
    this.config = config;
    this.strategies = {};
    // The default strategy differs from other strategies used because its implementation requires
    // password hashing and optionally storing en email.
    this.defaultStrategy = { strategy: LocalStrategy, authenticate: (done, name, args) => {
      const { user, password } = args;
      // TODO Validate user and password
      // First we need to determine if the user exists in the database.
      let userId;
      // Check if `user` is an email or a username to query accordingly
      if (isEmail(user)) {
        userId = this.findIdByEmail(user);
      } else {
        userId = this.findIdByUsername(user);
      }
      // If no user id was found, this user does not exist.
      if (!userId) {
        // TODO Error user does not exist
      } else {
        // The user exists, check if the provided password matches.
        // It just so happens that the unique identifier of the local service is the user's id
        // that's why it is passed in twice.
        const service = this.findService(userId, userId);
        const { profile } = service;
        // Check if password matches
        if (!this.comparePassword(password, profile.hash)) {
          // TODO Incorrect password
        } else {
          const foundUser = this.findUser(userId);
          done(null, foundUser);
        }
      }
    },
  };
  }
  addStrategy(name, strategy) {
    this.strategies[name] = strategy;
  }
  hashPassword(password) {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }
  comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
  authenticate(done, service, args) {
    // The strategy was added when instrumenting passport and apollo accounts.
    const strategy = this.strategies[service];
    if (!strategy) {
      throw new Error(`This Accounts instance doesn't have strategy ${name}.`);
    }
    // If the strategy provideds an authenticate callback it has some custom logic to authenticate
    // a user. Our default strategy provides an authenticate callback.
    if (isFunction(strategy.authenticate)) {
      // TODO call done, handle wrong password and user doesn't exist
      strategy.authenticate(done, service, args);
    } else {
      // Looks like we're sticking with the default authentication logic.
      // Extract a unique identifier to find the user from the service's response.
      // If the developer provides an `extract` callback, we use that instead of our default.
      const { profile } = args;
      const identifiers = isFunction(strategy.extract) ?
        strategy.extract(args) : this.strategyExtractIdentifiers(profile);
      const { identifier, username } = identifiers;
      // It's time to query the database and find the user's id based on the service's unique
      // identifier.
      let userId = this.findIdByService(service, identifier);
      // If a user is not found that means this is their first time logging in with this service.
      // We will create a new record in the `accounts` table for them and associate this service
      // with their account.
      if (!userId) {
        userId = this.createUser({ service, identifier, username, profile });
      }
      // Now that we have an id, let's find the user.
      // But wait...why didn't we just return a user object from one of the above calls?
      // The fields a user carries are defined by the app's business rules. The requirements may be
      // different from app to app. For example if the user has roles associated with them or
      // carries profile photos or a bio. Let the developer handle how the user is fetched.
      const user = this.findById(userId);
      // Last step, let passport know the user identified succesfully and provide the user object
      done(null, user);
    }
  }
  strategyExtractIdentifiers({ profile }) {
    // TODO This may not be reliable/accurate for all services. http://passportjs.org/docs/profile
    // Passport normalizes the response from the service to a standard format allowing us to
    // determine the id and username. Typically this is named `profile` in the response arguments.
    return { identifier: profile.id, username: profile.displayName };
  }
}

export default (passport, accounts, strategies = []) => {
  if (!passport) {
    throw new Error('Expects a passport instance');
  }
  if (!accounts) {
    throw new Error('Expects an Accounts instance');
  }

  const newStrategies = isArray(strategies) ? strategies : [strategies];

  newStrategies.push(accounts.defaultStrategy);

  newStrategies.forEach(({ strategy, options = {}, extract, authenticate }) => {
    if (isEmpty(strategy) && !isObject(strategy)) {
      throw new Error('Expects a passport strategy');
    }
    const strategyInstance = new strategy(options, // eslint-disable-line new-cap
      (...args) => accounts.authenticate(args.pop(), name, ...args)
    );
    accounts.addStrategy(strategyInstance.name, { extract, authenticate });
    passport.use(strategyInstance);
  });
  passport.serializeUser(accounts.serializeUser);
  passport.deserializeUser(accounts.deserializeUser);
  return passport;
};
