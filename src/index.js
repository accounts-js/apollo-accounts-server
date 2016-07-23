// @flow
import { isEmpty, isObject } from 'lodash';

import Accounts from './Accounts';

type Strategy = {
  strategy: any,
  name: string,
  verify: any,
  options: ?any
}

// TODO Passport doesn't have Flow definitions :'(
export default (passport: any, accounts: Accounts, strategies: [Strategy]) => {
  if (!passport) {
    throw new Error('Expects a passport instance');
  }
  if (!(accounts instanceof Accounts)) {
    throw new Error('Expects an Accounts instance');
  }
  // passport.use(accounts.defaultStrategy);
  // const newStrategies = isArray(strategies) ? strategies : [strategies];
  strategies.forEach(value => {
    const { strategy, name, verify, options } = value;
    if (isEmpty(strategy) && !isObject(strategy)) {
      throw new Error('Expects a passport strategy');
    }
    // eslint-disable-next-line new-cap
    const strategyInstance = new strategy(options || {},
      (...args) => accounts.verify(args.pop(), name, ...args)
    );
    accounts.addStrategy(strategyInstance.options);
    passport.use(strategyInstance);
  });
  return passport;
};
