export class Accounts {
  serializeUser(user, callback) {
    return callback(null, user);
  }
  deserializeUser(object, callback) {
    return callback(null, object);
  }
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
