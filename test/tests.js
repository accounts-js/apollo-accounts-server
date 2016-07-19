import chai, { expect } from 'chai';
import spies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';

import { Accounts } from '../src/';

chai.use(spies);
chai.use(chaiAsPromised);

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
