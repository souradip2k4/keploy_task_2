// src/__tests__/user.api.integration.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../app.js'; // Your main Express app
import { User } from '../../models/users.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
jest.mock('../../utils/cloudinary.js');
// Helper to get __dirname in ES modules

let mongoServer;

// Setup: Before all tests, start the in-memory MongoDB server and connect Mongoose.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Set up required environment variables for testing
  process.env.ACCESS_TOKEN_SECRET = 'test-secret-access';
  process.env.ACCESS_TOKEN_EXPIRY = '1m';
  process.env.REFRESH_TOKEN_SECRET = 'test-secret-refresh';
  process.env.REFRESH_TOKEN_EXPIRY = '5m';
});

// Teardown: After all tests, disconnect Mongoose and stop the server.
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clean up: Before each test, clear the users collection.
beforeEach(async () => {
  await User.deleteMany({});
});

describe('User API & Integration Tests (/api/v1/users)', () => {

  describe('POST /register', () => {
    it('should register a new user successfully and return 200', async () => {
      // Create paths to dummy files for upload
      const avatarPath = path.resolve(__dirname, 'test-files', 'avatar.png');
      const coverImagePath = path.resolve(__dirname, 'test-files', 'cover.png');
      
      const response = await request(app)
        .post('/api/v1/users/register')
        .field('fullName', 'Integration Test')
        .field('email', 'integ@test.com')
        .field('username', 'integtest')
        .field('password', 'Pass1234')
        .attach('avatar', avatarPath)
        .attach('coverImage', coverImagePath);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.email).toBe('integ@test.com');
      expect(response.body.data).not.toHaveProperty('password');

      // Verify user is in the database
      const dbUser = await User.findOne({ email: 'integ@test.com' });
      expect(dbUser).not.toBeNull();
      expect(dbUser.username).toBe('integtest');
    });

    it('should fail with 409 if username or email already exists', async () => {
        // First, create a user
        await new User({ 
            fullName: 'Existing User',
            email: 'existing@test.com',
            username: 'existinguser',
            password: 'password123',
            avatar: 'some_url'
        }).save();
        
        const avatarPath = path.resolve(__dirname, 'test-files', 'avatar.png');
        
        const response = await request(app)
            .post('/api/v1/users/register')
            .field('fullName', 'New User')
            .field('email', 'another@test.com')
            .field('username', 'existinguser') // Use existing username
            .field('password', 'Pass1234')
            .attach('avatar', avatarPath);

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a user to log in with
      const user = new User({
        fullName: 'Login User',
        email: 'login@test.com',
        username: 'logintest',
        password: 'password123', // Password will be hashed by pre-save hook
        avatar: 'some_url'
      });
      await user.save();
    });

    it('should log in a user and return tokens with 200', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.username).toBe('logintest');
      expect(response.headers['set-cookie']).toBeDefined();

      // Verify refreshToken is saved in DB
      const dbUser = await User.findOne({ email: 'login@test.com' });
      expect(dbUser.refreshToken).toBe(response.body.data.refreshToken);
    });

    it('should fail to log in with incorrect password and return 401', async () => {
        const response = await request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'login@test.com',
            password: 'wrongpassword',
          });
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /logout (Protected Route)', () => {
    it('should log out the user, clear cookies, and return 200', async () => {
      // 1. Register and Login to get a valid token
      const agent = request.agent(app); // Use an agent to persist cookies
      await agent
        .post('/api/v1/users/register')
        .field('fullName', 'Logout Test')
        .field('email', 'logout@test.com')
        .field('username', 'logouttest')
        .field('password', 'Pass1234')
        .attach('avatar', path.resolve(__dirname, 'test-files', 'avatar.png'));
        
      await agent
        .post('/api/v1/users/login')
        .send({ email: 'logout@test.com', password: 'Pass1234'});

      // 2. Logout
      const logoutResponse = await agent.get('/api/v1/users/logout');
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toBe('User logged out successfully');
      
      // Check that cookies are cleared
      const clearedCookies = logoutResponse.headers['set-cookie'];
      expect(clearedCookies[0]).toContain('accessToken=; Path=/; Expires=');
      expect(clearedCookies[1]).toContain('refreshToken=; Path=/; Expires=');

      // 3. Verify the refresh token is removed from the database
      const dbUser = await User.findOne({ email: 'logout@test.com' });
      expect(dbUser.refreshToken).toBeUndefined();
    });

    it('should return 401 if no access token is provided', async () => {
        const response = await request(app).get('/api/v1/users/logout');
        expect(response.status).toBe(401);
    });
  });
});