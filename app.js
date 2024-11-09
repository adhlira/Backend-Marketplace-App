import express from "express";
import sign_up_route from "./routes/sign_up.js";

const app = express();

app.use(express.json());
app.use(sign_up_route);

export default app;
