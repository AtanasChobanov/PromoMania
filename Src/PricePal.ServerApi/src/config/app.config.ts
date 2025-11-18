import express from "express";
import cors from "cors";
import productsRouter from "../routes/product.routes.js";
import usersRouter from "../routes/user.routes.js";
import authRouter from "../routes/auth.routes.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/products", AuthMiddleware.authenticate, productsRouter);
app.use("/users/:publicUserId", AuthMiddleware.authenticate, usersRouter);
app.use("/auth", authRouter);

export default app;
