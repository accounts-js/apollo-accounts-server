import chai, { expect } from 'chai';
import spies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';

import apolloAccounts, { Accounts } from '../src/';

chai.use(spies);
chai.use(chaiAsPromised);

describe('apolloAccounts', () => {
  const passport = {
    serializeUser() {

    },
    deserializeUser() {

    },
    use() {

    },
    addStrategy() {

    },
  };
  const accounts = {
    verify() {

    },
    addStrategy() {

    },
  };
  const strategy = class {

  };
  it('expects passport', () => {
    expect(() => apolloAccounts()).to.throw('Expects a passport instance');
  });
  it('expects accounts', () => {
    expect(() => apolloAccounts(passport).to.throw('Expects an Accounts instance'));
  });
  it('expects a strategy', () => {
    expect(() => apolloAccounts(passport, accounts))
      .to.throw('Expects a passport strategy');
  });
  it('can accept an array of strategies', () => {
    passport.use = chai.spy(passport.use);
    apolloAccounts(passport, accounts, [
      { strategy }, { strategy },
    ]);
    expect(passport.use).to.have.been.called.twice();
  });
  it('calls accounts.addStrategy', () => {
    accounts.addStrategy = chai.spy(accounts.addStrategy);
    apolloAccounts(passport, accounts, { strategy });
    expect(accounts.addStrategy).to.have.been.called();
  });
  it('calls passport.use', () => {
    passport.use = chai.spy(passport.use);
    apolloAccounts(passport, accounts, { strategy });
    expect(passport.use).to.have.been.called();
  });
});

describe('Accounts', () => {
  const accounts = new Accounts();
  it('provides a default serializeUser function', () => {
    const callback = chai.spy((err, object) => null); // eslint-disable-line no-unused-vars
    const user = {};
    accounts.serializeUser(user, callback);
    expect(callback).to.have.been.called.with(user);
  });
  it('provides a default deserializeUser function', () => {
    const callback = chai.spy((err, object) => null); // eslint-disable-line no-unused-vars
    const user = {};
    accounts.deserializeUser(user, callback);
    expect(callback).to.have.been.called.with(user);
  });
  it('addStrategy', () => {
    accounts.addStrategy('name', { verify: 'verify', find: 'find', create: 'create' });
    expect(accounts.strategies.name).to.exist;
    expect(accounts.strategies.name)
      .to.deep.equal({ verify: 'verify', find: 'find', create: 'create' });
  });
  describe('registerUser', () => {
    it('finds a user', () => {
      accounts.findUser = chai.spy((args) => args);
      accounts.createUser = chai.spy((args) => args);
      accounts.registerUser({ username: 'test', password: '123456' });
      expect(accounts.findUser).to.have.been.called.with({ username: 'test', password: '123456' });
      expect(accounts.createUser).to.not.have.been.called();
    });
    it('creates a user if they are not found', () => {
      accounts.findUser = chai.spy(() => null);
      accounts.createUser = chai.spy((args) => args);
      accounts.registerUser({ username: 'test', password: '123456' });
      expect(accounts.findUser).to.have.been.called.with({ username: 'test', password: '123456' });
      expect(accounts.createUser).to.not.have.been.called({ username: 'test', password: '123456' });
    });
  });
  /*
  describe('verify', () => {
    const username = 'user1';
    const password = 'password1';
    it('verifies authentication is successful', () => {
      const user = {};
      accounts.authenticate = (username, password) => {
        return new Promise(resolve => resolve('boo'));
      };
      const callback = chai.spy((err, user) => null);
      const verify = accounts.verify(username, password, callback);
      console.log(verify);
      console.log(callback);
      expect(callback).to.have.been.called();
      return verify;
    });
  });*/
});
