/* eslint-disable no-unused-expressions */
/* eslint-disable no-shadow */

import chai, { expect } from 'chai';
import spies from 'chai-spies';

import apolloAccounts, { Accounts as AccountsBase } from '../src/';

chai.use(spies);

class Accounts extends AccountsBase {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }
  findById() {

  }
  findIdByService() {

  }
  createUser() {

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
      expect(hash).to.be.okay;
      expect(accounts.comparePassword(password, hash)).to.be.true;
    });
    it('can detect wrong password', () => {
      const hash = accounts.hashPassword(password);
      expect(hash).to.be.okay;
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
  describe('authenticate', () => {
    let accounts;
    beforeEach(() => {
      accounts = new Accounts();
    });
    it('calls custom authenticate function if provided', () => {
      const authenticate = chai.spy((done, service, args) => {
        expect(done).to.be.a('function');
        expect(service).to.be.equal('local');
        expect(args).to.eql(['a', 'b']);
      });
      accounts.strategies.local = {
        authenticate,
      };
      accounts.authenticate(() => null, 'local', 'a', 'b');
    });
    it('throws error if service does not exist', () => {
      expect(() => accounts.authenticate(null, 'dne')).to.throw(Error);
    });
    it('uses default extract identifiers function', () => {
      const strategyExtractIdentifiers = chai.spy(accounts.strategyExtractIdentifiers);
      accounts.strategies.thirdParty = {

      };
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.authenticate(() => null, 'thirdParty', profile);
      expect(strategyExtractIdentifiers).to.have.been.called;
    });
    it('uses custom extract identifiers function', () => {
      const extract = chai.spy((foo, profile) => {
        expect(foo).to.be.eql('foo');
        expect(profile).to.be.eql({
          id: '123',
          displayName: 'abc',
        });
        return {
          identifier: '123',
          username: 'abc',
        };
      });
      accounts.strategies.thirdParty = {
        extract,
      };
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.authenticate(() => null, 'thirdParty', 'foo', profile);
      expect(extract).to.have.been.called;
    });
    it('calls findIdByService', () => {
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.strategies.thirdParty = {};
      accounts.findIdByService = chai.spy((service, id) => {
        expect(service).to.be.equal('thirdParty');
        expect(id).to.be.equal('123');
        return Promise.resolve(accounts.findIdByService);
      });
      accounts.createUser = chai.spy(accounts.createUser);
      accounts.authenticate(() => null, 'thirdParty', profile);
      expect(accounts.findIdByService).to.have.been.called;
      expect(accounts.createUser).to.not.have.been.called;
    });
    it('calls createUser if findIdByService returns falsy', (done) => {
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.strategies.thirdParty = {};
      accounts.findIdByService = () => Promise.resolve(false);
      accounts.createUser = chai.spy((args) => {
        expect(args).to.be.eql({
          service: 'thirdParty',
          identifier: '123',
          username: 'abc',
          profile,
        });
        done();
        return '456';
      });
      accounts.authenticate(() => null, 'thirdParty', profile);
    });
    it('calls findById and passes results to passport', () => {
      const done = chai.spy((result, user) => {
        expect(result).to.be.eql(null);
        expect(user).to.be.eql({
          username: 'abc',
          id: '456',
        });
      });
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.strategies.thirdParty = {};
      accounts.findById = chai.spy(userId => {
        expect(userId).to.be.eql('456');
        return {
          username: 'abc',
          id: '456',
        };
      });
      accounts.findIdByService = () => '456';
      accounts.authenticate(done, 'thirdParty', profile);
      expect(accounts.findById).to.have.been.called;
      expect(done).to.have.been.called;
    });
  });
});
