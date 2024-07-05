import {inject, injectable} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthenticationBindings, SecurityBindings} from '../keys';
import {Food, Money} from '../models';
import {securityId, UserProfile} from '../types';
import {
  DonationRepository,
  FoodRepository,
  MoneyRepository,
  MyUserRepository,
} from '../repositories';
import {MyUserService} from './user.service';

@injectable()
export class DonationService {
  constructor(
    @repository(MyUserRepository)
    public userRepository: MyUserRepository,
    @repository(FoodRepository)
    public foodRepository: FoodRepository,
    @repository(MoneyRepository)
    public moneyRepository: MoneyRepository,
    @repository(DonationRepository)
    public donationRepository: DonationRepository,
    @inject(AuthenticationBindings.CURRENT_USER)
    private currentUserProfile: UserProfile,
    @inject('services.MyUserService')
    public userService: MyUserService,
  ) {}

  // Food donations

  async createFoodDonation(
    fileBuffer: Buffer,
    quantity: number,
    quantityType: string,
    message: string,
    friendUsername: string,
  ): Promise<Food> {
    try {
      // Check if fileBuffer is provided
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new HttpErrors.BadRequest('Picture is required');
      }

      // Validate quantity
      if (quantity <= 0 || quantity > 1000) {
        throw new HttpErrors.BadRequest('Quantity must be greater than 0');
      }

      // Validate quantityType
      const allowedQuantityTypes = ['kg', 'g', 'lb', 'oz']; // Define allowed quantity types
      if (!allowedQuantityTypes.includes(quantityType)) {
        throw new HttpErrors.BadRequest('Invalid quantity type');
      }

      // Fetch the user ID of the authenticated user
      const donatorId = parseInt(this.currentUserProfile[securityId]);

      // Create Food instance
      const foodData = {
        donatorId: donatorId,
        picture: fileBuffer,
        quantity,
        quantityType,
        message,
        friendUsername,
      };
      const createdFood = await this.foodRepository.create(foodData);

      // Create donation record
      await this.donationRepository.create({
        userId: donatorId,
        itemId: createdFood.id,
      });

      return createdFood;
    } catch (error) {
      console.error('Error creating food donation:', error);
      throw error;
    }
  }

  async getDonations(): Promise<Food[]> {
    try {
      const donations = await this.foodRepository.find();
      return donations;
    } catch (error) {
      console.error('Error retrieving food donations:', error);
      throw new HttpErrors.InternalServerError(
        'Failed to retrieve food donations',
      );
    }
  }
  async findFoodDonation(filter?: Filter<Food>): Promise<Food[]> {
    try {
      await this.userService.checkAuthorization(
        this.currentUserProfile,
        'findFood',
        this,
      );
      const userId = parseInt(this.currentUserProfile[securityId], 10);
      const userFilter = {where: {donatorId: userId}};
      const mergedFilter = {...filter, ...userFilter};
      return this.foodRepository.find(mergedFilter);
    } catch (error) {
      console.error('Error finding food donations:', error);
      throw error;
    }
  }
  async countFoodDonation(where?: Where<Food>): Promise<number> {
    try {
      const count = await this.foodRepository.count(where);
      return count.count;
    } catch (error) {
      console.error('Error counting food donations:', error);
      throw new HttpErrors.InternalServerError(
        'Failed to count food donations',
      );
    }
  }

  async updateAllFoodDonation(
    food: Food,
    where?: Where<Food>,
  ): Promise<number> {
    try {
      const countResult = await this.foodRepository.updateAll(food, where);
      return countResult.count;
    } catch (error) {
      console.error('Error updating food donations:', error);
      throw new HttpErrors.InternalServerError(
        'Failed to update food donations',
      );
    }
  }

  async findByIdFoodDonation(
    id: number,
    filter?: FilterExcludingWhere<Food>,
  ): Promise<Food> {
    try {
      const food = await this.foodRepository.findById(id, filter);
      return food;
    } catch (error) {
      console.error(`Error finding food donation with id ${id}:`, error);
      throw error;
    }
  }

  async updateByIdFoodDonation(id: number, food: Food): Promise<void> {
    try {
      await this.foodRepository.updateById(id, food);
    } catch (error) {
      console.error(`Error updating food donation with id ${id}:`, error);
      throw error;
    }
  }

  async replaceByIdFoodDoantion(id: number, food: Food): Promise<void> {
    try {
      await this.foodRepository.replaceById(id, food);
    } catch (error) {
      console.error(`Error replacing food donation with id ${id}:`, error);
      throw error;
    }
  }

  async deleteByIdFoodDonation(id: number): Promise<void> {
    try {
      await this.foodRepository.deleteById(id);
    } catch (error) {
      console.error(`Error deleting food donation with id ${id}:`, error);
      throw new HttpErrors.InternalServerError(
        `Failed to delete food donation with id ${id}`,
      );
    }
  }

  // Money donations

  async createMoneyDonation(amount: number, currency: string): Promise<Money> {
    try {
      // Validate amount
      if (amount <= 0 || amount > 1000) {
        throw new HttpErrors.BadRequest('The amount value is not correct');
      }

      // Validate currency
      if (!currency) {
        throw new HttpErrors.BadRequest('You have to choose a currency');
      }

      // Extract authenticated user's ID from profile
      const donatorId = this.currentUserProfile[securityId];

      // Create and return the Money object
      const moneyData = {
        donatorId: parseInt(donatorId),
        amount: amount,
        currency: currency,
      };
      const createdMoneyDonation = await this.moneyRepository.create(moneyData);

      // Create donation record
      await this.donationRepository.create({
        userId: parseInt(donatorId),
        itemId: createdMoneyDonation.id,
      });

      return createdMoneyDonation;
    } catch (error) {
      console.error('Error creating money donation:', error);
      throw error;
    }
  }
  async findMoneyDonation(filter?: Filter<Money>): Promise<Money[]> {
    try {
      await this.userService.checkAuthorization(
        this.currentUserProfile,
        'findMoney',
        this,
      );
      const userId = parseInt(this.currentUserProfile[securityId], 10);
      const userFilter = {where: {donatorId: userId}};
      const mergedFilter = {...filter, ...userFilter};
      return this.moneyRepository.find(mergedFilter);
    } catch (error) {
      console.error('Error finding money donations:', error);
      throw error;
    }
  }
  async getMoneyDonations(): Promise<Money[]> {
    try {
      const moneyDonations = await this.moneyRepository.find();
      return moneyDonations;
    } catch (error) {
      console.error('Error fetching money donations:', error);
      throw error;
    }
  }

  async updateByIdMoneyDonation(id: number, money: Money): Promise<void> {
    try {
      await this.moneyRepository.updateById(id, money);
    } catch (error) {
      console.error(`Error updating money donation with id ${id}:`, error);
      throw error;
    }
  }
  async countMoneyDoantion(where?: Where<Money>): Promise<number> {
    try {
      const count = await this.moneyRepository.count(where);
      return count.count;
    } catch (error) {
      console.error('Error counting money donations:', error);
      throw new HttpErrors.InternalServerError(
        'Failed to count money donations',
      );
    }
  }

  async updateAllMoneyDonation(
    money: Money,
    where?: Where<Money>,
  ): Promise<number> {
    try {
      const countResult = await this.moneyRepository.updateAll(money, where);
      return countResult.count;
    } catch (error) {
      console.error('Error updating money donations:', error);
      throw error;
    }
  }
  async replaceByIdMoneyDonation(id: number, money: Money): Promise<void> {
    try {
      await this.moneyRepository.replaceById(id, money);
    } catch (error) {
      console.error(`Error replacing money donation with id ${id}:`, error);
      throw error;
    }
  }
  async deleteByIdMoneyDonation(id: number): Promise<void> {
    try {
      await this.moneyRepository.deleteById(id);
    } catch (error) {
      console.error(`Error deleting money donation with id ${id}:`, error);
      throw error;
    }
  }
}
