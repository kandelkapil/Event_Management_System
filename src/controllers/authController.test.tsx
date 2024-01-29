import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../models/index";
import { signUp, login, refresh } from "./authController";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

// Mocking the User model and other dependencies
jest.mock("../models/index", () => {
  const mockSequelize = {
    Op: {
      or: jest.fn(),
    },
  };

  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  return {
    db: {
      user: mockUser,
    },
    sequelize: mockSequelize,
  };
});

describe("signUp function", () => {
  it("should return a 409 status and error message if the user already exists", async () => {
    const req: Request = {
      body: {
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
      },
    } as Request;

    const res: Response = {
      status: jest.fn(() => res),
      send: jest.fn(),
    } as any;

    // Mocking the findOne function to simulate that an existing user is found
    db.user.findOne.mockResolvedValueOnce({
      id: 2,
      username: "existinguser",
      email: "existing@example.com",
      password: bcrypt.hashSync("password123", 8),
    });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith({
      message: "User with this email or username already exists.",
    });
  });

  it("should return a 400 status and error message if required fields are missing", async () => {
    const req: Request = {
      body: {},
    } as Request;

    const res: Response = {
      status: jest.fn(() => res),
      send: jest.fn(),
    } as any;

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Username, email, and password are required.",
    });
  });

  it("should create a new user and return user details on successful registration", async () => {
    const req: Request = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
    } as Request;

    const res: Response = {
      status: jest.fn(() => res),
      send: jest.fn(),
    } as any;

    // Mocking the findOne function to simulate that no existing user is found
    db.user.findOne.mockResolvedValueOnce(null);

    // Mocking the create function to simulate creating a new user
    db.user.create.mockResolvedValueOnce({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 8),
    });

    await signUp(req, res);

    expect(res.send).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      id: 1,
      message: "User was registered successfully!",
    });
  });
});

describe("login function", () => {
  it("should return a 401 status and error message if the password is invalid", async () => {
    const req: Request = {
      body: {
        username: "testuser",
        password: "wrongpassword",
      },
    } as Request;

    const res: Response = {
      status: jest.fn(() => res),
      json: jest.fn(),
      cookie: jest.fn(),
    } as any;

    // Mocking the findOne function to simulate finding a user
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 8),
    };

    db.user.findOne.mockResolvedValueOnce(mockUser);

    // Mocking the compareSync function to simulate an unsuccessful password match
    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid password",
    });
  });
});

describe("Refresh Function", () => {
  it("should refresh successfully and return a new access token", async () => {
    const req: Request = {
      cookies: { jwt: "valid_token" },
    } as Request;

    const res: Response = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as any;

    // Mocking the jwt.verify method to bypass the actual verification
    jwt.verify = jest.fn().mockImplementationOnce((token, secret, callback) => {
      callback(null, { username: "existing_user" });
    });

    // Mocking the User.findOne method to return a user
    const mockUser = {
      username: "existing_user",
      roles: ["user"],
    };
    // Casting to 'any' to avoid TypeScript error
    (db.user.findOne as any).mockResolvedValueOnce(mockUser);

    // Mocking the jwt.sign method to simulate generating a new access token
    jwt.sign = jest.fn().mockReturnValueOnce("new_access_token");

    await refresh(req, res);

    expect(res.json).toHaveBeenCalledWith({ accessToken: "new_access_token" });
  });
});
