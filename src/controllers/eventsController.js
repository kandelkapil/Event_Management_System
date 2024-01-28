import { db } from "../models/index.js";
const Events = db.events;
const User = db.user;
const Op = db.Sequelize.Op;

const eventsList = (req, res) => {
  Events.findAll({
    attributes: [
      "id",
      "name",
      "location",
      "picture",
      "created_by",
      "attendees",
      "description",
      "venue_time",
    ],
  })
    .then((events) => {
      const parsedEvents = events.map((event) => {
        // Parse attendees field if it's not null
        const attendeesArray = event.attendees
          ? event.attendees.map((jsonString) => JSON.parse(jsonString))
          : [];

        return {
          id: event.id,
          name: event.name,
          location: event.location,
          picture: event.picture,
          created_by: event.created_by,
          attendees: attendeesArray,
          description: event.description,
          venue_time: event.venue_time,
        };
      });

      res
        .status(200)
        .send({ events: parsedEvents, count: parsedEvents.length });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "event id is not provided" });
    }

    const foundEvent = await Events.findOne({
      where: {
        id: id,
      },
      attributes: [
        "id",
        "name",
        "location",
        "picture",
        "created_by",
        "attendees",
        "description",
        "venue_time",
      ],
    });

    if (!foundEvent) {
      const error = {
        status: "error",
        statusCode: 401,
        message: "Event is not registered",
      };
      return res.status(401).json(error);
    }

    res.json({ event: foundEvent });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserById = (req, res) => {
  const { id } = req.params;
  const {
    location,
    picture,
    created_by,
    attendees,
    description,
    venue_time,
    name,
  } = req.body;

  // Validate if userId is provided
  if (!id) {
    return res.status(400).send({ error: "Event id is required" });
  }

  // Find the user by ID
  Events.findByPk(id)
    .then((event) => {
      // Check if the event exists
      if (!event) {
        return res.status(404).send({ error: "Event not found" });
      }

      // Update event information based on provided data
      if (name) {
        event.name = name;
      }
      if (location) {
        event.location = location;
      }
      if (picture) {
        event.picture = picture;
      }
      if (created_by) {
        event.created_by = created_by;
      }
      if (attendees) {
        event.attendees = attendees;
      }
      if (venue_time) {
        event.venue_time = venue_time;
      }
      if (description) {
        event.description = description;
      }

      // Save the updated event
      return event.save();
    })
    .then((updatedEvent) => {
      const eventDetail = {
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        picture: updatedEvent.picture,
        created_by: updatedEvent.created_by,
        attendees: updatedEvent.attendees,
        description: updatedEvent.description,
        venue_time: updatedEvent.venue_time,
      };

      res
        .status(200)
        .send({ ...eventDetail, message: "Event successfully updated" });
    })
    .catch((err) => {
      console.error("Error updating event:", err);
      res.status(500).send({ message: "Internal Server Error" });
    });
};

const deleteEventById = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the event ID is passed in the URL params

    if (!id) {
      return res.status(400).json({ message: "Event id is not provided" });
    }

    // Find the event by ID
    const foundEvent = await Events.findOne({
      where: {
        id: id,
      },
    });

    // If the event is not found
    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete the event
    await foundEvent.destroy();

    // Send a success response
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const { location, picture, created_by, description, venue_time, name } =
      req.body;

    // Validate required fields
    if (!location || !created_by || !description || !venue_time || !name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if the event already exists
    const existingEvent = await Events.findOne({
      where: {
        name: name,
      },
    });

    if (existingEvent) {
      return res.status(400).json({
        message: "Event with the same name already exists",
      });
    }

    // Create a new event
    const newEvent = await Events.create({
      location,
      picture,
      created_by,
      description,
      venue_time,
      name,
    });

    const eventDetails = {
      location: newEvent.location,
      picture: newEvent.picture,
      created_by: newEvent.created_by,
      description: newEvent.description,
      venue_time: newEvent.venue_time,
      name: newEvent.name,
      message: "Event created successfully",
    };

    // Send a success response with the newly created event
    res.status(201).json({ ...eventDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId, action } = req.body;

    const existingUser = await User.findOne({
      where: {
        id: userId,
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

    // Check if the user exists
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Serialize user data appropriately for the array
    const userObject = existingUser.toJSON();
    const userString = JSON.stringify(userObject);

    // Check if the event exists
    const event = await Events.findOne({ where: { id: Number(eventId) } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Initialize attendees as an empty array if it's null
    event.attendees = event.attendees || [];

    const parsedEventAttendees = event.attendees.map((jsonString) =>
      JSON.parse(jsonString)
    );

    if (action === "register") {
      // Check if the user is already registered
      if (
        parsedEventAttendees.some((attendee) => attendee.id === existingUser.id)
      ) {
        return res
          .status(400)
          .json({ message: "User is already registered for this event" });
      }

      // Register the user for the event
      const updatedAttendees = [...event.attendees, userString];
      event.setDataValue("attendees", updatedAttendees);
    } else if (action === "cancel") {
      // Check if the user is registered for the event
      const userIndex = parsedEventAttendees.findIndex(
        (attendee) => attendee.id === existingUser.id
      );

      if (userIndex === -1) {
        return res.status(400).json({
          message: "User is not registered for this event",
        });
      }

      // Cancel the user's registration
      const updatedAttendees = [
        ...event.attendees.slice(0, userIndex),
        ...event.attendees.slice(userIndex + 1),
      ];
      event.setDataValue("attendees", updatedAttendees);
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await event.save();

    res
      .status(201)
      .json({ message: "Event status successfully updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export {
  getEventById,
  eventsList,
  deleteEventById,
  updateUserById,
  createEvent,
  registerEvent,
  // registrationList,
};
