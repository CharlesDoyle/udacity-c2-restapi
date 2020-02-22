// sequelize-typescript is our version of Sequelize, one that allows us to use typescript
import {Sequelize} from 'sequelize-typescript'; // a dependency in node_modules
import { config } from './config/config';


const c = config.dev;

// Instantiate new Sequelize instance with db info
// storage: ':memory:'   ()
export const sequelize = new Sequelize({
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host":     c.host,

  dialect: 'postgres',
  storage: ':memory:',
});

