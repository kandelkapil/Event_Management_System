import { Request, Response } from "express";
import { db } from "../models/index";

const Events = db.events;
const User = db.user;

const eventsList = (req: Request, res: Response): void => {
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
    .then((events: any) => {
      const parsedEvents = events.map((event: any) => {
        const attendeesArray = event.attendees
          ? event.attendees.map((jsonString: any) => JSON.parse(jsonString))
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
    .catch((err: any) => {
      console.error(err);
      res.status(500).send(err);
    });
};

const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "event id is not provided" });
      return;
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
      res.status(401).json(error);
      return;
    }

    res.json({ event: foundEvent });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserById = (req: Request, res: Response): void => {
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

  if (!id) {
    res.status(400).send({ error: "Event id is required" });
    return;
  }

  Events.findByPk(id)
    .then((event: any) => {
      if (!event) {
        return res.status(404).send({ error: "Event not found" });
      }

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

      return event.save();
    })
    .then((updatedEvent: any) => {
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
    .catch((err: any) => {
      console.error("Error updating event:", err);
      res.status(500).send({ message: "Internal Server Error" });
    });
};

const deleteEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Event id is not provided" });
      return;
    }

    const foundEvent = await Events.findOne({
      where: {
        id: id,
      },
    });

    if (!foundEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    await foundEvent.destroy();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location, picture, created_by, description, venue_time, name } =
      req.body;

    if (!location || !created_by || !description || !venue_time || !name) {
      res.status(400).json({ message: "Please provide all required fields" });
      return;
    }

    const existingEvent = await Events.findOne({
      where: {
        name: name,
      },
    });

    if (existingEvent) {
      res.status(400).json({
        message: "Event with the same name already exists",
      });
      return;
    }

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

    res.status(201).json({ ...eventDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerEvent = async (req: Request, res: Response): Promise<void> => {
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

    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userObject = existingUser.toJSON();
    const userString = JSON.stringify(userObject);

    const event = await Events.findOne({ where: { id: Number(eventId) } });
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    event.attendees = event.attendees || [];

    const parsedEventAttendees = event.attendees.map((jsonString: any) =>
      JSON.parse(jsonString)
    );

    if (action === "register") {
      if (
        parsedEventAttendees.some(
          (attendee: any) => attendee.id === existingUser.id
        )
      ) {
        res
          .status(400)
          .json({ message: "User is already registered for this event" });
        return;
      }

      const updatedAttendees = [...event.attendees, userString];
      event.setDataValue("attendees", updatedAttendees);
    } else if (action === "cancel") {
      const userIndex = parsedEventAttendees.findIndex(
        (attendee: any) => attendee.id === existingUser.id
      );

      if (userIndex === -1) {
        res.status(400).json({
          message: "User is not registered for this event",
        });
        return;
      }

      const updatedAttendees = [
        ...event.attendees.slice(0, userIndex),
        ...event.attendees.slice(userIndex + 1),
      ];
      event.setDataValue("attendees", updatedAttendees);
    } else {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    await event.save();

    res.status(201).json({ message: "Event status successfully updated" });
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
};
