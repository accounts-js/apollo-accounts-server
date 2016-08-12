# Accounts for Apollo Server

[![CircleCI](https://circleci.com/gh/TimMikeladze/apollo-accounts-server.svg?style=svg)](https://circleci.com/gh/TimMikeladze/apollo-accounts-server)

## Install

```sh
npm i -S apollo-accounts-server

npm i -S apollo-accounts-knexjs # If you're using Postgres, MSSQL, MySQL, MariaDB, SQLite3, or Oracle
npm i -S apollo-accounts-mongoose # If you're using Mongo
```

## Examples

### Express

## Supported databases

You'll need to install a package based on the type of database you're using. This package defines a schema and implements functions for reading and writing user account data.

- [x]  Postgres, MSSQL, MySQL, MariaDB, SQLite3, and Oracle - [apollo-accounts-knexjs](https://github.com/apollo-accounts/apollo-accounts-knexjs)
- [ ] Mongo - [apollo-accounts-mongoose](https://github.com/apollo-accounts/apollo-accounts-mongoose)

```sh
npm i -S apollo-accounts-knexjs # For SQL
npm i -S apollo-accounts-mongoose # For Mongo
```

## Configuration

Underneath the covers `apollo-accounts-server` uses [Grant](https://github.com/simov/grant) to handle signing in with different providers. It also adopts [Grant's configuration](https://github.com/simov/grant/blob/master/README.md#configuration) and builds upon it with `apollo-accounts-server` specific options.

- **server** - configuration about your server
  - **redirectTo** - route to redirect to on login
  - **loginWith** - methods with which the user can login with, defaults to `['username', 'email']`,
  - **signupWith** - methods with which the user can sign up with, defaults to `['username', 'email']`,
  - **protocol** - either `http` or `https`
  - **host** - your server's host name `localhost:3000` | `dummy.com:5000` | `mysite.com` ...
  - **path** - path prefix to use for the Grant middleware *(defaults to empty string if omitted)*
  - **callback** - common callback for all providers in your config `/callback` | `/done` ...
  - **transport** - transport to use to deliver the response data in your final callback `querystring` | `session` *(defaults to querystring if omitted)*
  - **state** - generate random state string on each authorization attempt `true` | `false` *(OAuth2 only, defaults to false if omitted)*
- **provider1** - any of [Grant's supported provider](https://github.com/simov/grant/blob/master/README.md#150-supported-providers--oauth-playground) `facebook` | `twitter` ...
  - **extract** - A function which fetches a unique identifier, username, and optionally a profile from the provider. It receives two arguments, an `accessToken` string and the `provider` object containing the provider's configuration. It must return an object with keys `identifier`, `username`, and optionally `profile`.
  - **key** - `consumer_key` or `client_id` of your app
  - **secret** - `consumer_secret` or `client_secret` of your app
  - **scope** - array of OAuth scopes to request
  - **callback** - specific callback to use for this provider *(overrides the global one specified under the `server` key)*
  - **custom_params** - custom authorization parameters *(see the [Custom Parameters][custom-parameters] section)*

```js
const config = {
  server: {
    secret: 'terrible secret',
    redirectTo: '/home',
  },
  github: {
    key: 'client key from github',
    secret: 'client secret from github',
  },
};
```


## How this package works
