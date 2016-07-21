import { isEmpty, isString, isObject, isArray, trim } from 'lodash';

export class Accounts {
  constructor() {
    this.strategies = {};
  }
  addStrategy(name, args) {
    this.strategies[name] = args;
  }
  serializeUser(user, callback) {
    return callback(null, user);
  }
  deserializeUser(object, callback) {
    return callback(null, object);
  }
  /**
   * Returns a promise that calls Passport's verify callback with the results this.authenticate
   * @param  {...object} ...args An array of objects, the last of which must be Passport's
   * verify callback.
   * @return Promise
   */
  verify(done, name, args) {
  }
}

export default (passport, accounts, strategies) => {
  if (!passport) {
    throw new Error('Expects a passport instance');
  }
  if (!accounts) {
    throw new Error('Expects an Accounts instance');
  }
  const newStrategies = isArray(strategies) ? strategies : [strategies];
  newStrategies.forEach(({ name, strategy, options = {}, verify, find, create }) => {
    if (isEmpty(name) || isString(name) && trim(name).length === 0) {
      throw new Error('Expects strategy to have a name');
    }
    if (isEmpty(strategy) && !isObject(strategy)) {
      throw new Error('Expects a passport strategy');
    }
    accounts.addStrategy(name, { verify, find, create });
    passport.use(name, new strategy(options), // eslint-disable-line new-cap
      (...args) => accounts.verify(args.pop(), name, ...args)
    );
  });
  passport.serializeUser(accounts.serializeUser);
  passport.deserializeUser(accounts.deserializeUser);
  return passport;
};
