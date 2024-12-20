import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({settings: {strict: false}})
export class RefreshToken extends Entity {
  @property({
    type: 'number',
    id: true, // Corrected to 'true' for primary key
    generated: true,
  })
  id: number;

  @belongsTo(() => User)
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  refreshToken: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<RefreshToken>) {
    super(data);
  }
}

export interface RefreshTokenRelations {
  // describe navigational properties here
}

export type RefreshTokenWithRelations = RefreshToken & RefreshTokenRelations;
