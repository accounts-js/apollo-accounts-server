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
    it('calls createUser', (done) => {
      accounts.createUser = chai.spy((args) => {
        expect(args.username).to.equal('UserA');
        expect(Accounts.comparePassword('123456', args.profile.hash)).to.equal(true);
        return Promise.resolve({ id: 1 });
      });
      accounts.registerUser({ user: 'UserA', password: '123456' }).then(res => {
        expect(accounts.createUser).to.have.been.called();
        expect(res.id).to.equal(1);
        done();
      });
    });
  });
  describe('toUsernameAndEmail', () => {
    it('username', () => {
      expect(Accounts.toUsernameAndEmail({ user: 'UserA' })).to.deep.equal({
        username: 'UserA',
        email: null,
      });
    });
    it('email', () => {
      expect(Accounts.toUsernameAndEmail({ user: 'UserA@users.com' })).to.deep.equal({
        username: null,
        email: 'UserA@users.com',
      });
    });
    it('username and email', () => {
      expect(Accounts.toUsernameAndEmail({
        user: null, username: 'UserA', email: 'UserA@users.com',
      })).to.deep.equal({
        username: 'UserA',
        email: 'UserA@users.com',
      });
    });
  });
  it('hash and compare', () => {
    const password = '123456';
    const hash = Accounts.hashPassword(password);
    expect(Accounts.comparePassword(password, hash)).to.equal(true);
    expect(Accounts.comparePassword('wrong password', hash)).to.equal(false);
  });
});
