import express from "express";
import cors from "cors";
import sign_up_route from "./routes/sign_up.js";
import login_route from "./routes/login.js";
import product_route from "./routes/product.js";
import categories_route from "./routes/categories.js";
import cart_route from "./routes/cart.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", true);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  next();
});

app.options("*", cors());
app.use(express.json());
app.use(sign_up_route);
app.use(login_route);
app.use(product_route);
app.use(categories_route);
app.use(cart_route);

export default app;
