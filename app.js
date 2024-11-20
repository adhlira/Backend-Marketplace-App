import express from "express";
import sign_up_route from "./routes/sign_up.js";
import login_route from "./routes/login.js";
import product_route from "./routes/product.js";
import categories_route from "./routes/categories.js";
import cart_route from "./routes/cart.js";

const app = express();

app.use(express.json());
app.use(sign_up_route);
app.use(login_route);
app.use(product_route);
app.use(categories_route);
app.use(cart_route);

export default app;
