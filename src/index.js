import { db } from "./models/index.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRoute from "./routes/authRoutes.js";
import UserRoute from "./routes/userRoutes.js";
import UtilsRoute from "./routes/utilsroute.js";

const PORT = process.env.PORT || 8000;

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
app.use("/api/upload", UtilsRoute);
app.get("*", (req, res) => {
  res.status(404).send({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}.`);
});
