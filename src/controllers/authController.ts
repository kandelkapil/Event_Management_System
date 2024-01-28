import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { db } from "../models/index.js";

const User = db.user;

const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validate request body
    if (!username || !email || !password) {
      res
        .status(400)
        .send({ message: "Username, email, and password are required." });
      return;
    }

    // Check if the user with the given email or username already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      res
        .status(409)
        .send({ message: "User with this email or username already exists." });
      return;
    }

    // Save User to Database
    const newUser = await User.create({
      username: username,
      email: email,
      password: bcrypt.hashSync(password, 8),
    });

    const userDetails = {
      username: newUser.username,
      email: newUser.email,
      id: newUser.id,
      message: "User was registered successfully!",
    };

    res.send({ ...userDetails });
  } catch (err) {
    console.error("Sign Up error:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password not provided" });
      return;
    }

    const foundUser = await User.findOne({
      where: {
        username: username,
      },
    });

    if (!foundUser) {
      res.status(401).json({
        status: "error",
        statusCode: 401,
        message: "User is not registered",
      });
      return;
    }

    const match = bcrypt.compareSync(password, foundUser.password);

    if (!match) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const accessToken = jwt.sign(
      {
        UserInfo: { username: foundUser.username },
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    // Create secure cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // Accessible only by the web server
      secure: true, // HTTPS
      sameSite: "none", // Cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry: set to match refreshToken
    });

    const userSubset = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      message: "Login Successfully",
      profile_pic: foundUser.profile_pic,
    };

    // Send accessToken containing username and roles
    res.json({ accessToken, ...userSubset });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const refresh = (req: Request, res: Response): void => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err: any, decoded: any) => {
        if (err) return res.status(403).json({ message: "Forbidden" });

        const foundUser = await User.findOne({
          where: {
            username: (decoded as { username: string }).username,
          },
        });

        if (!foundUser)
          return res.status(401).json({ message: "Unauthorized" });

        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: foundUser.username,
              roles: foundUser.roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "15m" }
        );

        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = (req: Request, res: Response): void => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      res.sendStatus(204); // No content
      return;
    }
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.json({ message: "Log out success" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { signUp, login, refresh, logout };
