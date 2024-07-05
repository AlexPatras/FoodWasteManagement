import {expect} from '@loopback/testlab';
import {MyUserService} from '../services';
import {MyUserRepository, UserCredentialsRepository} from '../repositories';
import {UserRole} from '../enums/userrole.enum';
import {HttpErrors} from '@loopback/rest';
import sinon, {SinonStubbedInstance} from 'sinon';
import {User} from '../models';
import {genSalt, hash} from 'bcryptjs';
import {UserCredentials} from '../models/user-credentials.model';

describe('MyUserService', () => {
  let userService: MyUserService;
  let myUserRepositoryMock: SinonStubbedInstance<MyUserRepository>;
  let userCredentialsRepositoryMock: SinonStubbedInstance<UserCredentialsRepository>;

  beforeEach(() => {
    myUserRepositoryMock = sinon.createStubInstance(MyUserRepository);
    userCredentialsRepositoryMock = sinon.createStubInstance(
      UserCredentialsRepository,
    );

    userService = new MyUserService(
      myUserRepositoryMock,
      userCredentialsRepositoryMock,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validateAndCreateUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const newUserRequest = {
        firstName: 'Johson',
        lastName: 'Don',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      const hashedPassword = await hash(
        newUserRequest.password,
        await genSalt(),
      );
      const createdUser = new User({
        ...newUserRequest,
        id: 1,
        password: hashedPassword,
      });

      myUserRepositoryMock.create.resolves(createdUser);
      userCredentialsRepositoryMock.create.resolves(new UserCredentials());

      // Act
      const result = await userService.validateAndCreateUser(
        newUserRequest as User,
      );

      // Assert
      expect(result).to.eql(createdUser);
      sinon.assert.calledOnceWithExactly(
        myUserRepositoryMock.create,
        newUserRequest,
      );
      sinon.assert.calledOnce(userCredentialsRepositoryMock.create);
    });

    it('should throw an error if the first name contains special characters', async () => {
      const newUserRequest = {
        firstName: 'Don@',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'First name should not contain any special characters.',
        );
      }
    });
    it('should throw an error if the last name contains special characters', async () => {
      const newUserRequest = {
        firstName: 'Don',
        lastName: 'Johson#',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'Last name should not contain any special characters.',
        );
      }
    });

    it('should throw an error if the first name exceeds 10 characters', async () => {
      const newUserRequest = {
        firstName: 'DonDonDonDon',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'First name should have a maximum of 10 characters.',
        );
      }
    });

    it('should throw an error if the last name exceeds 10 characters', async () => {
      const newUserRequest = {
        firstName: 'Don',
        lastName: 'JohsonJohsonJohson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'Last name should have a maximum of 10 characters.',
        );
      }
    });

    it('should throw an error if the phone number is invalid', async () => {
      const newUserRequest = {
        firstName: 'Don',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: 'abcdefgh',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'Phone number must be exactly 10 digits and contain no special characters.',
        );
      }
    });

    it('should throw an error if the email format is invalid', async () => {
      const newUserRequest = {
        firstName: 'Don',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'invalidemail',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal('Invalid email format.');
      }
    });

    it('should throw an error if the username contains special characters', async () => {
      const newUserRequest = {
        firstName: 'Don',
        lastName: 'Johson',
        userName: 'johsond&',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'Username must not contain special characters.',
        );
      }
    });

    it('should throw an error if the username is already in use', async () => {
      const existingUser = new User({
        firstName: 'Don',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: await hash('password123', await genSalt()),
        phoneNumber: '1234567890',
        role: UserRole.User,
      });

      myUserRepositoryMock.findOne.resolves(existingUser);

      const newUserRequest = {
        firstName: 'Don',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal('Username is already in use.');
      }
    });

    it('should throw an error if the password is less than 8 characters', async () => {
      const newUserRequest = {
        firstName: 'Don',
        lastName: 'Johson',
        userName: 'johsond',
        email: 'johson.don@example.com',
        password: 'pass',
        phoneNumber: '1234567890',
        role: UserRole.User,
      };

      try {
        await userService.validateAndCreateUser(newUserRequest as User);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.BadRequest);
        expect(error.message).to.equal(
          'Password must be at least 8 characters long.',
        );
      }
    });
  });
  describe('verifyCredentials', () => {
    const validCredentials = {
      username: 'johsond',
      password: 'password123',
    };

    const invalidCredentials = {
      username: 'johsond_invalid',
      password: 'invalid_password',
    };

    const userWithInvalidPassword = new User({
      id: 1,
      userName: 'johsond',
      password: 'hashed_password',
    });

    const userWithValidCredentials = new User({
      id: 1,
      userName: 'johsond',
      password: 'hashed_password',
    });

    it('throws Unauthorized error if user is not found', async () => {
      myUserRepositoryMock.findOne.resolves(null);

      try {
        await userService.verifyCredentials(validCredentials);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.Unauthorized);
        expect(error.message).to.equal('Invalid username or password.');
      }
    });

    it('throws Unauthorized error if user is found but credentials are not found', async () => {
      myUserRepositoryMock.findOne.resolves(userWithInvalidPassword);
      myUserRepositoryMock.findCredentials.resolves(undefined);
      try {
        await userService.verifyCredentials(validCredentials);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.Unauthorized);
        expect(error.message).to.equal('Invalid username or password.');
      }
    });

    it('throws Unauthorized error if password does not match', async () => {
      myUserRepositoryMock.findOne.resolves(userWithInvalidPassword);
      myUserRepositoryMock.findCredentials.resolves({
        username: 'johndoe',
        password: 'different_hashed_password',
      } as UserCredentials);

      try {
        await userService.verifyCredentials(validCredentials);
        throw new Error('Expected the method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(HttpErrors.Unauthorized);
        expect(error.message).to.equal('Invalid username or password.');
      }
    });

    it('returns user if credentials are valid', async () => {
      myUserRepositoryMock.findOne.resolves(userWithValidCredentials);
      myUserRepositoryMock.findCredentials.resolves({
        username: 'johndoe',
        password: await hash(validCredentials.password, await genSalt()),
      } as UserCredentials);

      const result = await userService.verifyCredentials(validCredentials);

      expect(result).to.deepEqual(userWithValidCredentials);
    });
  });
  describe('getUsers', () => {
    it('should return a list of users', async () => {
      // Arrange
      const expectedUsers: User[] = [
        new User({
          id: 1,
          firstName: 'Johson',
          lastName: 'Don',
          email: 'johnson.don@example.com',
        }),
        new User({
          id: 2,
          firstName: 'Matt',
          lastName: 'Damon',
          email: 'matt.damon@example.com',
        }),
      ];
      myUserRepositoryMock.find.resolves(expectedUsers);

      // Act
      const result = await userService.getUsers();

      // Assert
      expect(result).to.eql(expectedUsers);
      sinon.assert.calledOnce(myUserRepositoryMock.find);
    });

    it('should throw an error if userRepository.find() fails', async () => {
      const errorMessage = 'Database connection error';
      myUserRepositoryMock.find.rejects(new Error(errorMessage));

      try {
        await userService.getUsers();
        throw new Error('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).to.eql(errorMessage);
      }
    });
  });

  describe('findById', () => {
    it('should return the user with the specified id and filter', async () => {
      // Arrange
      const userId = 1;
      const filter = {fields: {id: true, firstName: true}};
      const user = new User({id: userId, firstName: 'Johson'});

      myUserRepositoryMock.findById.resolves(user);

      // Act
      const result = await userService.findById(userId, filter);

      // Assert
      expect(result).to.eql(user);
      sinon.assert.calledOnceWithExactly(
        myUserRepositoryMock.findById,
        userId,
        filter,
      );
    });
  });

  describe('deleteById', () => {
    it('should delete the user with the specified id', async () => {
      // Arrange
      const userId = 1;

      // Act
      userService.deleteById(userId);

      // Assert
      sinon.assert.calledOnceWithExactly(
        myUserRepositoryMock.deleteById,
        userId,
      );
    });
  });
});
