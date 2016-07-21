import { isEmpty, isString, isObject, isArray, trim } from 'lodash';

export class Accounts {
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
  verify(...args) {
    const done = args.pop();
    return this.authenticate(...args).then(value => {
      const { user } = value;
      return done(null, user);
    }, reason => {
      const { err, user } = reason;
      const { notFound, wrongCredentials } = user;
      let res;
      if (err) {
        res = done(err);
      } else if (notFound || wrongCredentials) {
        res = done(null, false);
      }
      return res;
    });
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
  newStrategies.forEach(({ name, strategy, options = {}, verify, findOrCreate }) => {
    if (isEmpty(name) || isString(name) && trim(name).length === 0) {
      throw new Error('Expects strategy to have a name');
    }
    if (isEmpty(strategy) && !isObject(strategy)) {
      throw new Error('Expects a passport strategy');
    }
    accounts.addStrategy(name, { verify, findOrCreate });
    passport.use(name, new strategy(options), accounts.verify); // eslint-disable-line new-cap
  });
  passport.serializeUser(accounts.serializeUser);
  passport.deserializeUser(accounts.deserializeUser);
  return passport;
};
