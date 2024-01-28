import { db } from "./models/index";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRoute from "./routes/authRoutes";
import UserRoute from "./routes/userRoutes";
import UtilsRoute from "./routes/utilsroute";
import EventRoute from "./routes/eventsRoutes";

const PORT: number | string = process.env.PORT || 8000;

const app = express();

db.sequelize.sync();

app.use(cookieParser());

app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/events", EventRoute);
app.use("/api/upload", UtilsRoute);
app.get("*", (req: Request, res: Response) => {
  res.status(404).send({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}.`);
});
