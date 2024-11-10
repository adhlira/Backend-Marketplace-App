import express from "express";
import sign_up_route from "./routes/sign_up.js";
import login_route from "./routes/login.js";

const app = express();

app.use(express.json());
app.use(sign_up_route);
app.use(login_route);

export default app;
