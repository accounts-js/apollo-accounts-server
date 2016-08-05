import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { Accounts } from '../src/';

chai.use(spies);

describe('apolloAccounts', () => {

});

describe('Accounts', () => {
  let accounts;
  beforeEach(() => {
    accounts = new Accounts();
  });
  describe('loginWithProvider', () => {
    const extraction = Promise.resolve({
      identifier: '1',
      username: 'UserA',
      profile: 'some data',
    });
    it('existing user', (done) => {
      accounts.findByProvider = chai.spy(() => Promise.resolve('123'));
      accounts.loginWithProvider('some provider', extraction).then(userId => {
        expect(userId).to.equal('123');
        expect(accounts.findByProvider).to.have.been.called.with('some provider', '1');
        done();
      });
    });
    it('new user', (done) => {
      accounts.findByProvider = () => Promise.resolve(null);
      accounts.createUser = chai.spy(() => Promise.resolve('123'));
      accounts.loginWithProvider('some provider', extraction).then(userId => {
        expect(userId).to.equal('123');
        expect(accounts.createUser).to.have.been.called.with({
          provider: 'some provider',
          identifier: '1',
          username: 'UserA',
          profile: 'some data',
        });
        done();
      });
    });
  });
  describe('registerUser', () => {
    it('');
  });
  describe('toUsernameAndEmail', () => {
    it('username', () => {

    });
    it('email', () => {

    });
    it('username and email', () => {

    });
  });
  it('hash and compare', () => {

  });
});
