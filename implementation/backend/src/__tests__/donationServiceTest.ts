import sinon from 'sinon';
import {expect} from '@loopback/testlab';
import {DonationService, MyUserService} from '../services';
import {
  FoodRepository,
  MoneyRepository,
  DonationRepository,
  MyUserRepository,
} from '../repositories';
import {UserProfile, securityId} from '@loopback/security';
import {Food, Money} from '../models';
import {HttpErrors} from '@loopback/rest';
import {Filter} from '@loopback/filter';

describe('DonationService', () => {
  let donationService: DonationService;
  let currentUserProfile: UserProfile;
  let foodRepositoryMock: sinon.SinonStubbedInstance<FoodRepository>;
  let moneyRepositoryMock: sinon.SinonStubbedInstance<MoneyRepository>;
  let donationRepositoryMock: sinon.SinonStubbedInstance<DonationRepository>;
  let myUserRepositoryMock: sinon.SinonStubbedInstance<MyUserRepository>;
  let userServiceMock: sinon.SinonStubbedInstance<MyUserService>;

  beforeEach(() => {
    foodRepositoryMock = sinon.createStubInstance(FoodRepository);
    moneyRepositoryMock = sinon.createStubInstance(MoneyRepository);
    donationRepositoryMock = sinon.createStubInstance(DonationRepository);
    myUserRepositoryMock = sinon.createStubInstance(MyUserRepository);
    userServiceMock = sinon.createStubInstance(MyUserService);

    currentUserProfile = {
      [securityId]: 'test-user-id',
      name: 'Test User',
      roles: ['test-role'],
    } as UserProfile;

    donationService = new DonationService(
      myUserRepositoryMock,
      foodRepositoryMock,
      moneyRepositoryMock,
      donationRepositoryMock,
      currentUserProfile,
      userServiceMock,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Food Donations', () => {
    describe('createFoodDonation', () => {
      it('throws BadRequest error if picture is not provided', async () => {
        const invalidFileBuffer = Buffer.alloc(0);

        try {
          await donationService.createFoodDonation(
            invalidFileBuffer,
            10,
            'kg',
            'Fresh apples',
            'friendUsername',
          );
          throw new Error('Test failed: Expected BadRequest error');
        } catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.BadRequest);
          expect(error.message).to.match(/Picture is required/);
        }
      });

      it('throws BadRequest error if quantity is invalid', async () => {
        try {
          await donationService.createFoodDonation(
            Buffer.from('picture data'),
            0,
            'kg',
            'Fresh apples',
            'friendUsername',
          );
          throw new Error('Test failed: Expected BadRequest error');
        } catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.BadRequest);
          expect(error.message).to.match(/Quantity must be greater than 0/);
        }
      });

      it('throws BadRequest error if quantityType is invalid', async () => {
        const invalidQuantityType = 'invalid-type';

        try {
          await donationService.createFoodDonation(
            Buffer.from('picture data'),
            10,
            invalidQuantityType,
            'Fresh apples',
            'friendUsername',
          );
          throw new Error('Test failed: Expected BadRequest error');
        } catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.BadRequest);
          expect(error.message).to.match(/Invalid quantity type/);
        }
      });

      it('creates a food donation', async () => {
        const fileBuffer = Buffer.from('picture data');
        const quantity = 10;
        const quantityType = 'kg';
        const message = 'Fresh apples';
        const friendUsername = 'friendUsername';

        const expectedFood = new Food({
          id: 1,
          donatorId: parseInt(currentUserProfile[securityId], 10),
          picture: fileBuffer,
          quantity,
          quantityType,
          message,
          friendUsername,
        });

        foodRepositoryMock.create.resolves(expectedFood);

        let result;
        try {
          result = await donationService.createFoodDonation(
            fileBuffer,
            quantity,
            quantityType,
            message,
            friendUsername,
          );
        } catch (error) {
          throw new Error(`Test failed: ${error.message}`);
        }

        expect(result).to.deepEqual(expectedFood);
        sinon.assert.calledOnce(foodRepositoryMock.create);
      });
    });

    describe('getDonations', () => {
      it('returns all food donations', async () => {
        const foodDonations: Food[] = [
          new Food({
            id: 1,
            donatorId: 1,
            picture: Buffer.from('picture1'),
            quantity: 5,
            quantityType: 'kg',
            message: 'Fresh apples',
            friendUsername: 'friend1',
          }),
          new Food({
            id: 2,
            donatorId: 1,
            picture: Buffer.from('picture2'),
            quantity: 3,
            quantityType: 'lb',
            message: 'Fresh bananas',
            friendUsername: 'friend2',
          }),
        ];

        foodRepositoryMock.find.resolves(foodDonations);

        let result;
        try {
          result = await donationService.getDonations();
        } catch (error) {
          throw new Error(`Test failed: ${error.message}`);
        }

        expect(result).to.deepEqual(foodDonations);
        sinon.assert.calledOnce(foodRepositoryMock.find);
      });

      it('throws an InternalServerError if retrieving donations fails', async () => {
        const error = new Error('Database error');
        foodRepositoryMock.find.rejects(error);

        try {
          await donationService.getDonations();
          throw new Error('Test failed: Expected InternalServerError');
        } catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.InternalServerError);
          expect(error.message).to.equal('Failed to retrieve food donations');
        }

        sinon.assert.calledOnce(foodRepositoryMock.find);
      });
    });

    describe('findFoodDonation', () => {
      it('finds food donations of the authenticated user', async () => {
        const userId = parseInt(currentUserProfile[securityId], 10);
        const filter: Filter<Food> = {where: {donatorId: userId}};

        userServiceMock.checkAuthorization.resolves();

        const expectedFoods: Food[] = [
          new Food({
            id: 1,
            donatorId: userId,
            picture: Buffer.from('picture data'),
            quantity: 10,
            quantityType: 'kg',
            message: 'Fresh apples',
            friendUsername: 'friendUsername',
          }),
        ];

        foodRepositoryMock.find.resolves(expectedFoods);

        let result;
        try {
          result = await donationService.findFoodDonation(filter);
        } catch (error) {
          throw new Error(`Test failed: ${error.message}`);
        }

        expect(result).to.deepEqual(expectedFoods);
        sinon.assert.calledOnceWithExactly(
          userServiceMock.checkAuthorization,
          currentUserProfile,
          'findFood',
          donationService,
        );
        sinon.assert.calledOnceWithExactly(
          foodRepositoryMock.find,
          sinon.match(filter),
        );
      });
    });

    describe('countFoodDonation', () => {
      it('should return the count of food donations', async () => {
        foodRepositoryMock.count.resolves({count: 10});

        let count;
        try {
          count = await donationService.countFoodDonation();
        } catch (error) {
          throw new Error(`Test failed: ${error.message}`);
        }

        expect(count).to.equal(10);
      });

      it('should throw an InternalServerError if count fails', async () => {
        const error = new Error('Database error');
        foodRepositoryMock.count.rejects(error);

        try {
          await donationService.countFoodDonation();
          throw new Error('Test failed: Expected InternalServerError');
        } catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.InternalServerError);
          expect(error.message).to.equal('Failed to count food donations');
        }
      });
    });

    describe('updateAllFoodDonation', () => {
      it('updates food donations and returns count', async () => {
        const foodToUpdate: Food = new Food({
          id: 1,
          donatorId: 1,
          picture: Buffer.from('picture1'),
          quantity: 5,
          quantityType: 'kg',
          message: 'Fresh apples',
          friendUsername: 'friend1',
        });

        const whereClause = {id: 1};

        foodRepositoryMock.updateAll
          .withArgs(foodToUpdate, whereClause)
          .resolves({count: 1});

        let result;
        try {
          result = await donationService.updateAllFoodDonation(
            foodToUpdate,
            whereClause,
          );
        } catch (error) {
          throw new Error(`Test failed: ${error.message}`);
        }

        expect(result).to.equal(1);
        sinon.assert.calledOnce(foodRepositoryMock.updateAll);
      });

      it('throws InternalServerError if update fails', async () => {
        const foodToUpdate: Food = new Food({
          id: 1,
          donatorId: 2,
          picture: Buffer.from('picture1'),
          quantity: 20,
          quantityType: 'kg',
          message: 'Food',
          friendUsername: 'Alex',
        });

        const whereClause = {id: 1};

        const error = new Error('Database error');
        foodRepositoryMock.updateAll
          .withArgs(foodToUpdate, whereClause)
          .rejects(error);

        try {
          await donationService.updateAllFoodDonation(
            foodToUpdate,
            whereClause,
          );
          throw new Error('Test failed: Expected InternalServerError');
        } catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.InternalServerError);
          expect(error.message).to.equal('Failed to update food donations');
        }
      });
    });

    describe('deleteByIdFoodDonation', () => {
      it('successfully deletes a food donation', async () => {
        const foodId = 1;

        foodRepositoryMock.deleteById.withArgs(foodId).resolves();

        try {
          await donationService.deleteByIdFoodDonation(foodId);
        } catch (error) {
          throw new Error(`Test failed: ${error.message}`);
        }

        sinon.assert.calledOnceWithExactly(
          foodRepositoryMock.deleteById,
          foodId,
        );
      });
    });
  });

  describe('Money Donations', () => {
    describe('Money Donations', () => {
      describe('createMoneyDonation', () => {
        it('throws BadRequest error if the amount value is not correct', async () => {
          const invalidAmount = -10;
          const currency = 'eur';

          await expect(
            donationService.createMoneyDonation(invalidAmount, currency),
          ).to.be.rejectedWith(
            HttpErrors.BadRequest,
            /The amount value is not correct/,
          );
        });

        it('throws BadRequest error if the currency is empty', async () => {
          const amount = 10;
          const emptyCurrency = '';

          await expect(
            donationService.createMoneyDonation(amount, emptyCurrency),
          ).to.be.rejectedWith(
            HttpErrors.BadRequest,
            /You have to choose a currency/,
          );
        });

        it('successfully creates a money donation', async () => {
          const amount = 100;
          const currency = 'USD';

          const expectedMoneyDonation = new Money({
            id: 1,
            donatorId: parseInt(currentUserProfile[securityId], 10),
            amount,
            currency,
          });

          moneyRepositoryMock.create.resolves(expectedMoneyDonation);

          let result;
          try {
            result = await donationService.createMoneyDonation(
              amount,
              currency,
            );
          } catch (error) {
            throw new Error(`Test failed: ${error.message}`);
          }

          expect(result).to.deepEqual(expectedMoneyDonation);
          sinon.assert.calledOnceWithExactly(moneyRepositoryMock.create, {
            donatorId: parseInt(currentUserProfile[securityId], 10),
            amount,
            currency,
          });

          sinon.assert.calledOnceWithExactly(donationRepositoryMock.create, {
            userId: parseInt(currentUserProfile[securityId], 10),
            itemId: 1,
          });
        });
      });

      describe('getMoneyDonations', () => {
        it('successfully retrieves money donations', async () => {
          const moneyDonations: Money[] = [
            new Money({
              id: 1,
              donatorId: 1,
              amount: 100,
              currency: 'USD',
            }),
            new Money({
              id: 2,
              donatorId: 1,
              amount: 50,
              currency: 'EUR',
            }),
          ];

          moneyRepositoryMock.find.resolves(moneyDonations);

          let result;
          try {
            result = await donationService.getMoneyDonations();
          } catch (error) {
            throw new Error(`Test failed: ${error.message}`);
          }

          expect(result).to.deepEqual(moneyDonations);
          sinon.assert.calledOnce(moneyRepositoryMock.find);
        });
      });

      describe('countMoneyDonation', () => {
        it('should return the count of money donations', async () => {
          moneyRepositoryMock.count.resolves({count: 10});

          let count;
          try {
            count = await donationService.countMoneyDoantion();
          } catch (error) {
            throw new Error(`Test failed: ${error.message}`);
          }

          expect(count).to.equal(10);
        });

        it('should throw an InternalServerError if count fails', async () => {
          const error = new Error('Database error');
          moneyRepositoryMock.count.rejects(error);

          try {
            await donationService.countMoneyDoantion();
            throw new Error('Test failed: Expected InternalServerError');
          } catch (error) {
            expect(error).to.be.instanceOf(HttpErrors.InternalServerError);
            expect(error.message).to.equal('Failed to count money donations');
          }
        });
      });

      describe('findMoneyDonation', () => {
        it('finds money donations of the authenticated user', async () => {
          const userId = parseInt(currentUserProfile[securityId], 10);
          const filter: Filter<Money> = {where: {donatorId: userId}};

          userServiceMock.checkAuthorization.resolves();

          const expectedMoneyDonation: Money[] = [
            new Money({
              id: 1,
              donatorId: userId,
              amount: 100,
              currency: 'EUR',
            }),
          ];

          moneyRepositoryMock.find.resolves(expectedMoneyDonation);

          let result;
          try {
            result = await donationService.findMoneyDonation(filter);
          } catch (error) {
            throw new Error(`Test failed: ${error.message}`);
          }

          expect(result).to.deepEqual(expectedMoneyDonation);
          sinon.assert.calledOnceWithExactly(
            userServiceMock.checkAuthorization,
            currentUserProfile,
            'findMoney',
            donationService,
          );
          sinon.assert.calledOnceWithExactly(
            moneyRepositoryMock.find,
            sinon.match(filter),
          );
        });
      });

      describe('updateAllMoneyDonation', () => {
        it('updates money donations and returns count', async () => {
          const moneyToUpdate: Money = new Money({
            id: 1,
            donatorId: 1,
            amount: 100,
            currency: 'EUR',
          });

          const whereClause = {id: 1};

          moneyRepositoryMock.updateAll
            .withArgs(moneyToUpdate, whereClause)
            .resolves({count: 1});

          const result = await donationService.updateAllMoneyDonation(
            moneyToUpdate,
            whereClause,
          );

          expect(result).to.equal(1);
          sinon.assert.calledOnce(moneyRepositoryMock.updateAll);
        });
      });

      describe('deleteByIdMoneyDonation', () => {
        it('successfully deletes a money donation', async () => {
          const id = 1;

          moneyRepositoryMock.deleteById.withArgs(id).resolves();

          try {
            await donationService.deleteByIdMoneyDonation(id);
          } catch (error) {
            throw new Error(`Test failed: ${error.message}`);
          }

          sinon.assert.calledOnceWithExactly(
            moneyRepositoryMock.deleteById,
            id,
          );
        });
      });
    });
  });
});
