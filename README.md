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
- [ ] Mongo [apollo-accounts-mongo](https://github.com/apollo-accounts/apollo-accounts-mongoose)

```sh
npm i -S apollo-accounts-knexjs # For SQL
npm i -S apollo-accounts-mongoose # For Mongo
```

## How this package works
