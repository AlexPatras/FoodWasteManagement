import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  Request,
  requestBody,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import multer from 'multer';
import {authorize} from '../decorators';
import {UserRole} from '../enums/userrole.enum';
import {Food} from '../models';
import {FoodRepository} from '../repositories';
import {DonationService, MyUserService} from '../services';

const storage = multer.memoryStorage();
const upload = multer({storage});

@authenticate('jwt')
export class FoodController {
  constructor(
    @inject(SecurityBindings.USER)
    private currentUser: UserProfile,
    @repository(FoodRepository)
    public foodRepository: FoodRepository,
    @inject('services.DonationService')
    public donationService: DonationService,
    @inject('services.MyUserService')
    public userService: MyUserService,
  ) {}

  @post('/foodDonation', {
    responses: {
      200: {
        description: 'Food model instance',
        content: {
          'application/json': {schema: {'x-ts-type': Food}},
        },
      },
    },
  })
  async create(
    @requestBody.file() request: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Food> {
    return new Promise<Food>((resolve, reject) => {
      upload.single('picture')(request, res, (err: unknown) => {
        if (err) {
          reject(err);
        } else {
          try {
            const picture = request.file?.buffer;
            const {quantity, quantityType, message, friendUsername} =
              request.body;

            this.donationService
              .createFoodDonation(
                picture!,
                quantity,
                quantityType,
                message,
                friendUsername,
              )
              .then(savedFood => {
                resolve(savedFood);
              })
              .catch(error => {
                reject(error);
              });
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  @get('/foods/count')
  @response(200, {
    description: 'Food model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Food) where?: Where<Food>): Promise<Count> {
    const count = await this.donationService.countFoodDonation(where);
    return {count};
  }

  @get('/foods')
  @response(200, {
    description: 'Array of Food model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Food, {includeRelations: true}),
        },
      },
    },
  })
  @authorize([UserRole.User])
  async find(@param.filter(Food) filter?: Filter<Food>): Promise<Food[]> {
    return this.donationService.findFoodDonation(filter);
  }

  @patch('/foods')
  @response(200, {
    description: 'Food PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Food, {partial: true}),
        },
      },
    })
    food: Food,
    @param.where(Food) where?: Where<Food>,
  ): Promise<Count> {
    const count = await this.donationService.updateAllFoodDonation(food, where);
    return {count};
  }

  @get('/foods/{id}')
  @response(200, {
    description: 'Food model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Food, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Food, {exclude: 'where'}) filter?: FilterExcludingWhere<Food>,
  ): Promise<Food> {
    return this.donationService.findByIdFoodDonation(id, filter);
  }

  @patch('/foods/{id}')
  @response(204, {
    description: 'Food PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Food, {partial: true}),
        },
      },
    })
    food: Food,
  ): Promise<void> {
    this.donationService.updateByIdFoodDonation(id, food);
  }

  @put('/foods/{id}')
  @response(204, {
    description: 'Food PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() food: Food,
  ): Promise<void> {
    this.donationService.replaceByIdFoodDoantion(id, food);
  }

  @del('/foods/{id}')
  @response(204, {
    description: 'Food DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    this.donationService.deleteByIdFoodDonation(id);
  }
}
