/* eslint-disable no-unused-expressions */

import chai, { expect } from 'chai';
import spies from 'chai-spies';

import apolloAccounts, { Accounts as AccountsBase } from '../src/';

chai.use(spies);

class Accounts extends AccountsBase {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }
}

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
  const strategy = class {

  };
  const accounts = new Accounts();

  it('expects passport', () => {
    expect(() => apolloAccounts()).to.throw('Expects a passport instance');
  });
  it('expects accounts', () => {
    expect(() => apolloAccounts(passport).to.throw('Expects an Accounts instance'));
  });

  it('can accept an array of strategies', () => {
    passport.use = chai.spy(passport.use);
    apolloAccounts(passport, accounts, [
      { strategy }, { strategy },
    ]);
    expect(passport.use).to.have.been.called.min(2);
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
  /*
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
  */
  it('addStrategy', () => {
    accounts.addStrategy('name', { });
    // eslint-disable-next-line no-unused-expressions
    expect(accounts.strategies.name).to.exist;
    expect(accounts.strategies.name)
      .to.deep.equal({ });
  });
  /*
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
  */
  describe('hashing', () => {
    const password = '123456';
    it('can encrypt and decrypt a correct password', () => {
      const hash = accounts.hashPassword(password);
      // eslint-disable-next-line no-unused-expressions
      expect(hash).to.be.okay;
      // eslint-disable-next-line  no-unused-expressions
      expect(accounts.comparePassword(password, hash)).to.be.true;
    });
    it('can detect wrong password', () => {
      const hash = accounts.hashPassword(password);
      // eslint-disable-next-line no-unused-expressions
      expect(hash).to.be.okay;
      // eslint-disable-next-line  no-unused-expressions
      expect(accounts.comparePassword('wrong password', hash)).to.be.false;
    });
  });
  it('strategyExtractIdentifiers', () => {
    const profile = {
      id: '123',
      displayName: 'name',
      otherField: 'other',
    };
    expect(accounts.strategyExtractIdentifiers(profile)).to.deep.equal({
      identifier: '123',
      username: 'name',
    });
  });
});
