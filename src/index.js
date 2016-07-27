import { isEmpty, isObject, isArray, isFunction, pick } from 'lodash';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Thank you http://stackoverflow.com/a/46181
function isEmail(email) {
  // eslint-disable-next-line max-len
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
    this.defaultStrategy = { strategy: LocalStrategy,
      authenticate: (done, name, user, password) => {
        // TODO Validate user and password
        let promise = Promise.resolve();
        let userId;
        // First we need to determine if the user exists in the database.
        // Check if `user` is an email or a username to query accordingly
        if (isEmail(user)) {
          promise = promise.then(() => this.findIdByEmail(user));
        } else {
          promise = promise.then(() => this.findIdByUsername(user));
        }
        // If no user id was found, this user does not exist.
        promise
          .then(id => {
            if (!id) {
              done('User does not exist', null);
            }
            userId = id;
            return userId;
          })
          // The user exists, check if the provided password matches.
          // It just so happens that the unique identifier of the local service is the user's id
          // that's why it is passed in twice.
          .then((id) => this.findService(id, id))
          .then(service => {
            const { profile } = service;
            // Check if password matches
            if (!this.comparePassword(password, profile.hash)) {
              done('Incorrect password', null);
            } else {
              this.findUser(userId).then((foundUser) => {
                done(null, foundUser);
              });
            }
          });
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
  authenticate(done, service, ...args) {
    // The strategy was added when instrumenting passport and apollo accounts.
    const strategy = this.strategies[service];
    if (!strategy) {
      throw new Error(`This Accounts instance doesn't have strategy ${service}.`);
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
      let profile = args[args.length - 1];
      profile = isFunction(strategy.profile) ? strategy.profile(profile)
        : this.strategyProfile(profile);
      const identifiers = isFunction(strategy.extract) ?
        strategy.extract(...args) : this.strategyExtractIdentifiers(profile);
      const { identifier, username } = identifiers;

      Promise.resolve()
        // It's time to query the database and find the user's id based on the service's unique
        // identifier.
        .then(() => this.findIdByService(service, identifier))
        // If a user is not found that means this is their first time logging in with this service.
        // We will create a new record in the `accounts` table for them and associate this service
        // with their account.
        .then(userId => userId || this.createUser({ service, identifier, username, profile }))
        // Now that we have an id, let's find the user.
        // But wait...why didn't we just return a user object from one of the above calls?
        // The fields a user carries are defined by the app's business rules. The requirements may
        // be different from app to app. For example if the user has roles associated with them or
        // carries profile photos or a bio. Let the developer handle how the user is fetched.
        .then(userId => this.findForSession(userId, identifier))
        // Last step, let passport know the user identified succesfully and provide the user object
        .then(user => {
          done(null, user);
        });
    }
  }
  strategyProfile(profile) {
    return pick(profile, ['provider', 'id', 'displayName', 'name', 'emails', 'photos']);
  }
  strategyExtractIdentifiers(profile) {
    // TODO This may not be reliable/accurate for all services. http://passportjs.org/docs/profile
    // Passport normalizes the response from the service to a standard format allowing us to
    // determine the id and username. Typically this is named `profile` in the response arguments.
    return { identifier: profile.id, username: profile.displayName };
  }
  transformProfile(profile) {
    return profile;
  }
  registerUser({ username, email, password }) {
    const hash = this.hashPassword(password);
    const profile = { hash };
    return this.createUser({ service: 'local', username, email, profile });
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

  // accounts.addStrategy('local', accounts.defaultStrategy);

  newStrategies.forEach(({ strategy, options = {}, name, extract, profile, authenticate }) => {
    if (isEmpty(strategy) && !isObject(strategy)) {
      throw new Error('Expects a passport strategy');
    }
    const strategyInstance = new strategy(options, // eslint-disable-line new-cap
      (...args) => {
        // console.log(args);
        // const done = args.pop();
        accounts.authenticate(args.pop(), name, ...args);
        // done(null, args.pop());
      }
    );
    accounts.addStrategy(name, { extract, profile, authenticate });
    passport.use(strategyInstance);
  });
  // TODO Only apply if functions are defined
  // passport.serializeUser(accounts.serializeUser);
  // passport.deserializeUser(accounts.deserializeUser);
  return passport;
};
