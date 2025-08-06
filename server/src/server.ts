const express = require("express");
const app = express();
const port = 3000;
let cors = require("cors");

app.use(cors("*"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
  console.log(`minipos app listening on port ${port}`);
});
