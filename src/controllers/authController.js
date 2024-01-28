import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../models/index.js";
const User = db.user;
const Op = db.Sequelize.Op;

const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate request body
    if (!username || !email || !password) {
      return res
        .status(400)
        .send({ message: "Username, email, and password are required." });
    }

    // Check if the user with the given email or username already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .send({ message: "User with this email or username already exists." });
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
    res.status(500).send({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password not provided" });
    }

    const foundUser = await User.findOne({
      where: {
        username: username,
      },
    });

    if (!foundUser) {
      const error = {
        status: "error",
        statusCode: 401,
        message: "User is not registered",
      };
      return res.status(401).json(error);
    }

    const match = bcrypt.compareSync(password, foundUser.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: { username: foundUser.username },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Create secure cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true, // Accessible only by the web server
      secure: true, // HTTPS
      sameSite: "None", // Cross-site cookie
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

const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({
        where: {
          username: decoded.username,
        },
      });

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Log out success" });
};

export { signUp, login, refresh, logout };
