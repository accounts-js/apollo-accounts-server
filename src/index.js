import { isEmpty, isString, isObject, isArray, trim } from 'lodash';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class Accounts {
  constructor() {
    this.strategies = {};
    /*
    this.defaultStrategy = new LocalStrategy((username, password, done) => {
      Promise.resolve()
        .then(() => this.findUser({ username }));
    });
    */
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
  hashPassword(password) {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }
  comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
  verify(done, name, args) {
    console.log(done);
    console.log(name);
    console.log(args);
  }
  registerUser(args) {
    let user = this.findUser(args);
    if (!user) {
      user = this.createUser(args);
    }
    return user;
  }
}

export default (passport, accounts, strategies = []) => {
  if (!passport) {
    throw new Error('Expects a passport instance');
  }
  if (!accounts) {
    throw new Error('Expects an Accounts instance');
  }
  passport.use(accounts.defaultStrategy);
  const newStrategies = isArray(strategies) ? strategies : [strategies];
  newStrategies.forEach(({ strategy, options = {}, verify, find, create }) => {
    if (isEmpty(strategy) && !isObject(strategy)) {
      throw new Error('Expects a passport strategy');
    }
    const strategyInstance = new strategy(options, // eslint-disable-line new-cap
      (...args) => accounts.verify(args.pop(), name, ...args)
    );
    accounts.addStrategy(strategyInstance.name, { verify, find, create });
    passport.use(strategyInstance);
  });
  passport.serializeUser(accounts.serializeUser);
  passport.deserializeUser(accounts.deserializeUser);
  return passport;
};
