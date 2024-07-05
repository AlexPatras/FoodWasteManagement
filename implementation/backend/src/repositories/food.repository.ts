import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {SecurityBindings} from '../keys';
import {Food, FoodRelations} from '../models';
import {UserProfile} from '../types';

export class FoodRepository extends DefaultCrudRepository<
  Food,
  typeof Food.prototype.id,
  FoodRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Food, dataSource);
  }
}
