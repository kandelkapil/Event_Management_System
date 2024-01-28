const User = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING,
    },
    first_name: {
      type: Sequelize.STRING,
    },
    last_name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    profile_pic: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    phone_number: {
      type: Sequelize.STRING,
    },

    description: {
      type: Sequelize.TEXT,
    },
    followers: {
      type: Sequelize.STRING,
    },
  });

  return User;
};

export default User;
