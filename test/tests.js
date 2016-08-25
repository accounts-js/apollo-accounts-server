/* eslint-disable no-unused-expressions */

import chai, { expect } from 'chai';
import spies from 'chai-spies';

import { Accounts } from '../src/';
import config from '../src/config';

chai.use(spies);

describe('apolloAccounts', () => {

});

describe('Accounts', () => {
  let accounts;
  beforeEach(() => {
    accounts = new Accounts(config({
      server: {
        secret: 'terrible secret',
      },
    }));
  });
  describe('loginWithProvider', () => {
    const extraction = Promise.resolve({
      identifier: '1',
      username: 'UserA',
      profile: 'some data',
    });
    it('existing user', (done) => {
      accounts.findByProvider = chai.spy(() => Promise.resolve('123'));
      accounts
        .loginWithProvider('some provider', extraction)
        .then(({ userId, accessToken, refreshToken }) => {
          expect(userId).to.equal('123');
          expect(accounts.findByProvider).to.have.been.called.with('some provider', '1');
          expect(accessToken).to.be.ok;
          expect(refreshToken).to.be.ok;
          done();
    });
    it('new user', (done) => {
      accounts.findByProvider = () => Promise.resolve(null);
      accounts.createUser = chai.spy(() => Promise.resolve('123'));
      accounts
        .loginWithProvider('some provider', extraction)
        .then(({ userId, accessToken, refreshToken }) => {
          expect(userId).to.equal('123');
          expect(accounts.createUser).to.have.been.called.with({
            provider: 'some provider',
            identifier: '1',
            username: 'UserA',
            profile: 'some data',
          });
          expect(accessToken).to.be.ok;
          expect(refreshToken).to.be.ok;
          done();
        });
    });
  });
  describe('registerUser', () => {
    it('calls createUser', (done) => {
      accounts.createUser = chai.spy((args) => {
        expect(args.username).to.equal('UserA');
        expect(Accounts.comparePassword('123456', args.hash)).to.equal(true);
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
  describe('loginUser', () => {
    it('can login with username', (done) => {
      const password = '123456';
      const hash = Accounts.hashPassword(password);
      accounts.findByUsername = chai.spy(() => Promise.resolve(1));
      accounts.findHashById = chai.spy(() => Promise.resolve(hash));
      accounts.loginUser({
        username: 'UserA',
        password,
      }).then(() => {
        expect(accounts.findByUsername).to.have.been.called();
        expect(accounts.findHashById).to.have.been.called();
        done();
      });
    });
    it('can login with email', (done) => {
      const password = '123456';
      const hash = Accounts.hashPassword(password);
      accounts.findByEmail = chai.spy(() => Promise.resolve(1));
      accounts.findHashById = chai.spy(() => Promise.resolve(hash));
      accounts.loginUser({
        email: 'usera@user.com',
        password,
      }).then(() => {
        expect(accounts.findByEmail).to.have.been.called();
        expect(accounts.findHashById).to.have.been.called();
        done();
      });
    });
    it('error if user does not exist', (done) => {
      accounts.findByEmail = chai.spy(() => Promise.resolve(null));
      accounts.loginUser({
        email: 'usera@user.com',
        password: '123456',
      }).catch(() => {
        done();
      });
    });
    it('error if incorrect password', (done) => {
      const password = '123456';
      const hash = Accounts.hashPassword(password);
      accounts.findByUsername = chai.spy(() => Promise.resolve(1));
      accounts.findHashById = chai.spy(() => Promise.resolve(hash));
      accounts.loginUser({
        username: 'UserA',
        password: 'wrong password',
      }).catch(() => {
        expect(accounts.findByUsername).to.have.been.called();
        expect(accounts.findHashById).to.have.been.called();
        done();
      });
    });
  });
});
