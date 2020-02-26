import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, ForeignKey} from 'sequelize-typescript';
import { User } from '../../users/models/User';

// make a table with the FeedItem Model that has these columns
// @Table and @Column are sequelize decorators to indicate the SQL term that maps to our JS object
// the FeedItem Model is a sequelize js object that maps to a sql table
@Table
export class FeedItem extends Model<FeedItem> {
  @Column
  public caption!: string; // ! means caption can be null

  @Column
  public url!: string;
  // createdAt will be a sequelize column with a sequelize timestamp of CreatedAt
  // @CreatedAt decorator turns on the db option for each new record to get a datestamp
  @Column
  @CreatedAt
  public createdAt: Date = new Date();
  // each time updatedAt column is updated, @UpdatedAt runs a new timestamp
  @Column
  @UpdatedAt
  public updatedAt: Date = new Date();
}

// postgres table models for our DB