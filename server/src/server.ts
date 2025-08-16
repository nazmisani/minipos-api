import router from "./routers/index.route";
import express from "express";

const app = express();
const port = 3000;
let cors = require("cors");

app.use(cors("*"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`minipos app listening on port ${port}`);
});
