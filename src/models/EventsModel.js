const Events = (sequelize, Sequelize) => {
  const Events = sequelize.define("events", {
    location: {
      type: Sequelize.STRING,
    },
    picture: {
      type: Sequelize.STRING,
    },
    created_by: {
      type: Sequelize.STRING,
    },
    attendees: {
      type: Sequelize.ARRAY(Sequelize.JSON),
    },
    description: {
      type: Sequelize.STRING,
    },
    venue_time: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
  });

  return Events;
};

export default Events;
