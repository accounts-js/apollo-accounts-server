/* eslint-disable no-unused-expressions */
/* eslint-disable no-shadow */

import chai, { expect } from 'chai';
import spies from 'chai-spies';

import apolloAccounts, { Accounts as AccountsBase } from '../src/';

chai.use(spies);

class Accounts extends AccountsBase {
}

const passport = {

};

describe('apolloAccounts', () => {
  let accounts;
  const strategy = class {};
  beforeEach(() => {
    accounts = new Accounts();
  });

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
  let accounts;
  beforeEach(() => {
    accounts = new Accounts();
  });
  it('addStrategy', () => {
    accounts.addStrategy('name', { });
    expect(accounts.strategies.name).to.exist;
    expect(accounts.strategies.name)
      .to.deep.equal({ });
  });
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
    describe('defaultStrategy', () => {
      beforeEach(() => {
        accounts.defaultStrategy.authenticate = chai.spy(accounts.defaultStrategy.authenticate);
      });
      it('calls findIdByEmail if provided an email', (done) => {
        accounts.findIdByEmail = chai.spy(email => {
          expect(email).to.be.equal('user@user.com');
          done();
          return '1';
        });
        accounts.defaultStrategy.authenticate(() => null, 'local', 'user@user.com', 'password');
        expect(accounts.findIdByEmail).to.have.been.called;
      });
      it('calls findIdByUsername if provided a username', (done) => {
        accounts.findIdByUsername = chai.spy(username => {
          expect(username).to.be.equal('user');
          done();
          return '2';
        });
        accounts.defaultStrategy.authenticate(() => null, 'local', 'user', 'password');
        expect(accounts.findIdByUsername).to.have.been.called;
      });
      it('calls findService', (done) => {
        accounts.findService = chai.spy((userId) => {
          expect(userId).to.equal('123');
          done();
          return Promise.resolve({
            profile: {
              hash: 'hash',
            },
          });
        });
        accounts.findIdByUsername = () => '123';
        accounts.defaultStrategy.authenticate(() => null, 'local', 'user', 'password');
        expect(accounts.findService).to.have.been.called;
      });
      it('error on wrong password', (done) => {
        accounts.findIdByUsername = () => '123';
        accounts.findService = () => Promise.resolve({
          profile: {
            hash: accounts.hashPassword('password'),
          },
        });
        const passportDone = chai.spy((err, user) => {
          expect(err).to.be.equal('Incorrect password');
          expect(user).to.be.equal(null);
          done();
        });
        accounts.defaultStrategy.authenticate(passportDone, 'local', 'user', 'wrong password');
        expect(passportDone).to.have.been.called;
      });
      it('finds user on correct password', (done) => {
        accounts.findIdByUsername = () => '123';
        accounts.findService = () => Promise.resolve({
          profile: {
            hash: accounts.hashPassword('password'),
          },
        });
        accounts.findUser = chai.spy(() => Promise.resolve({
          id: '123',
          username: 'user',
        }));
        const passportDone = chai.spy((err, user) => {
          expect(err).to.be.equal(null);
          expect(user).to.be.eql({
            id: '123',
            username: 'user',
          });
          done();
        });
        accounts.defaultStrategy.authenticate(passportDone, 'local', 'user', 'password');
        expect(passportDone).to.have.been.called;
        expect(accounts.findUser).to.have.been.called;
      });
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
    it('uses default strategyProfile function', () => {
      const strategyProfile = chai.spy(accounts.strategyProfile);
      accounts.strategies.thirdParty = {

      };
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.authenticate(() => null, 'thirdParty', profile);
      expect(strategyProfile).to.have.been.called;
    });
    it('uses custom profile function', () => {
      const profileFunction = chai.spy((profile) => {
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
        profile: profileFunction,
      };
      const profile = {
        id: '123',
        displayName: 'abc',
      };
      accounts.authenticate(() => null, 'thirdParty', 'foo', profile);
      expect(profileFunction).to.have.been.called;
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
    it('registerUser with email', (done) => {
      accounts.createUser = chai.spy((args) => {
        // expect(args.username).to.be.equal('user1');
        expect(args.email).to.be.equal('user1@user.com');
        expect(args.service).to.be.equal('local');
        expect(accounts.comparePassword('password', args.profile.hash)).to.be.true;
        return Promise.resolve(1);
      });
      accounts.registerUser({ user: 'user1@user.com', password: 'password' })
        .then(id => {
          expect(id).to.be.equal(1);
          expect(accounts.createUser).to.have.been.called;
          done();
        });
    });
    it('registerUser with username', (done) => {
      accounts.createUser = chai.spy((args) => {
        expect(args.username).to.be.equal('user1');
        expect(args.service).to.be.equal('local');
        expect(accounts.comparePassword('password', args.profile.hash)).to.be.true;
        return Promise.resolve(1);
      });
      accounts.registerUser({ user: 'user1', password: 'password' })
        .then(id => {
          expect(id).to.be.equal(1);
          expect(accounts.createUser).to.have.been.called;
          done();
        });
    });
  });
});
