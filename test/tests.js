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
  it('expects a strategy name', () => {
    expect(() => apolloAccounts(passport, accounts, { strategy: {} }))
      .to.throw('Expects strategy to have a name');
    expect(() => apolloAccounts(passport, accounts, { name: '', strategy }))
      .to.throw('Expects strategy to have a name');
    expect(() => apolloAccounts(passport, accounts, { name: ' ', strategy }))
      .to.throw('Expects strategy to have a name');
  });
  it('expects a strategy', () => {
    expect(() => apolloAccounts(passport, accounts, { name: 'name' }))
      .to.throw('Expects a passport strategy');
  });
  it('can accept an array of strategies', () => {
    passport.use = chai.spy(passport.use);
    apolloAccounts(passport, accounts, [
      { name: 'name1', strategy }, { name: 'name2', strategy },
    ]);
    expect(passport.use).to.have.been.called.twice();
  });
  it('calls accounts.addStrategy', () => {
    accounts.addStrategy = chai.spy(accounts.addStrategy);
    apolloAccounts(passport, accounts, { name: 'name', strategy });
    expect(accounts.addStrategy).to.have.been.called.with('name');
  });
  it('calls passport.use', () => {
    passport.use = chai.spy(passport.use);
    apolloAccounts(passport, accounts, { name: 'name', strategy });
    expect(passport.use).to.have.been.called.with('name');
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
