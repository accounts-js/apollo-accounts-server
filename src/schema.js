const accountsSchema = [`

type Tokens {
  accessToken: ID!
  refreshToken: ID!
}

type User {
  id: ID!
}

type Query {
  currentUser: User
}

type Mutation {
  registerUser(user: String, username: String, email: String, password: String!): User
  loginUser(user: String, username: String, email: String, password: String!): Tokens
}

schema {
  query: Query
  mutation: Mutation
}
`];

const accountsResolvers = {
  Query: {
    currentUser(_, {}, context) {
      return {
        id: '1',
      };
    },
  },
  Mutation: {
    registerUser(_, args, { accounts }) {
      return accounts.registerUser(args);
    },
    loginUser(_, args) {
      return accounts.loginUser(args);
    },
  },
};

export { accountsSchema, accountsResolvers };
