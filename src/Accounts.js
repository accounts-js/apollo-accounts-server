// @flow
// import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

type Strategy = {
  name: string,
  verify: ?any;
};

export class Accounts {
  strategies: { [key: string] : Strategy};
  addStrategy(strategy: Strategy) {
    this.strategies[strategy.name] = strategy;
  }
  hashPassword(password: string): string {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }
  comparePassword(password: string, hash: string) : string {
    return bcrypt.compareSync(password, hash);
  }
  verify() {
  }
  findUser() {
  }
  createUser() {
  }
  registerUser(...args: any) {
    let user = this.findUser(args);
    if (!user) {
      user = this.createUser(args);
    }
    return user;
  }
}

export default Accounts;
