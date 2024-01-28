import { db } from "../models/index.js";
const User = db.user;

const usersList = (req, res) => {
  User.findAll({
    attributes: [
      "id",
      "first_name",
      "last_name",
      "username",
      "email",
      "profile_pic",
      "description",
      "phone_number",
      "address",
      "followers",
    ],
  })
    .then((users) => {
      res.status(200).send({ users, count: users.length });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "user id is not provided" });
    }

    const foundUser = await User.findOne({
      where: {
        id: id,
      },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "username",
        "email",
        "profile_pic",
        "description",
        "phone_number",
        "address",
        "followers",
      ],
    });

    if (!foundUser) {
      const error = {
        status: "error",
        statusCode: 401,
        message: "User is not registered",
      };
      return res.status(401).json(error);
    }

    // Send accessToken containing username and roles
    res.json({ user: foundUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserById = (req, res) => {
  const { profile_pic, address, phone, description, id, firstName, lastName } =
    req.body;

  // Validate if userId is provided
  if (!id) {
    return res.status(400).send({ error: "User ID is required" });
  }

  // Find the user by ID
  User.findByPk(id)
    .then((user) => {
      // Check if the user exists
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Update user information based on provided data
      if (firstName) {
        user.first_name = firstName;
      }
      if (lastName) {
        user.last_name = lastName;
      }
      if (profile_pic) {
        user.profile_pic = profile_pic;
      }
      if (address) {
        user.address = address;
      }
      if (phone) {
        user.phone_number = phone;
      }
      if (description) {
        user.description = description;
      }

      // Save the updated user
      return user.save();
    })
    .then((updatedUser) => {
      const userDetail = {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        username: updatedUser.username,
        email: updatedUser.email,
        profile_pic: updatedUser.profile_pic,
        description: updatedUser.description,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        followers: updatedUser.followers,
      };

      res
        .status(200)
        .send({ ...userDetail, message: "User successfully updated" });
    })
    .catch((err) => {
      console.error("Error updating user:", err);
      res.status(500).send({ message: "Internal Server Error" });
    });
};

export { usersList, updateUserById, getUserById };
