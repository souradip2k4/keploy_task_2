// src/controllers/__tests__/user.controller.unit.test.js
import { registerUser } from '../user.controller.js';
import { User } from '../../models/users.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Mock the entire modules
jest.mock('../../models/users.model.js');
jest.mock('../../utils/cloudinary.js');
jest.mock('../../utils/ApiError.js');
jest.mock('../../utils/ApiResponse.js');

describe('User Controller - Unit Tests', () => {
  describe('registerUser', () => {
    let req, res;

    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();

      // Mock Express request and response objects
      req = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        },
        files: {
          avatar: [{ path: '/tmp/avatar.jpg' }],
          coverImage: [{ path: '/tmp/cover.jpg' }],
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should register a user successfully', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null); // No existing user
      uploadOnCloudinary.mockResolvedValue({ url: 'http://cloudinary.url/image.jpg' });
      User.create.mockResolvedValue({
        _id: 'someUserId',
        fullName: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
      });
      User.findById.mockResolvedValue({ // for the createdUser check
        _id: 'someUserId',
        fullName: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
      });

      // Act
      await registerUser(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: 'testuser' }, { email: 'test@example.com' }] });
      expect(uploadOnCloudinary).toHaveBeenCalledTimes(2);
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(ApiResponse));
      expect(ApiResponse).toHaveBeenCalledWith(200, expect.any(Object), 'User registered Successfully');
    });

    it('should throw an ApiError if fields are missing', async () => {
      // Arrange
      req.body.username = ''; // Missing username

      // Act & Assert
      await expect(registerUser(req, res)).rejects.toThrow(ApiError);
      expect(ApiError).toHaveBeenCalledWith(400, "All fields are required");
    });

    it('should throw an ApiError if user already exists', async () => {
      // Arrange
      User.findOne.mockResolvedValue({ username: 'testuser', email: 'test@example.com' });

      // Act & Assert
      await expect(registerUser(req, res)).rejects.toThrow(ApiError);
      expect(ApiError).toHaveBeenCalledWith(409, "user with email or username already exists");
    });

    it('should throw an ApiError if avatar file is missing', async () => {
      // Arrange
      req.files.avatar = []; // No avatar file

      // Act & Assert
      await expect(registerUser(req, res)).rejects.toThrow(ApiError);
      expect(ApiError).toHaveBeenCalledWith(400, "Avatar file required");
    });
    
    it('should throw an ApiError if avatar upload fails', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      // Mock Cloudinary upload to fail for the avatar
      uploadOnCloudinary.mockImplementation(path => {
        if (path === '/tmp/avatar.jpg') return Promise.resolve(null);
        return Promise.resolve({ url: 'http://cloudinary.url/cover.jpg' });
      });

      // Act & Assert
      await expect(registerUser(req, res)).rejects.toThrow(ApiError);
      expect(ApiError).toHaveBeenCalledWith(400, "Avatar file not uploaded to cloudinary");
    });
  });
});