require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use("/google", require("./src/routes/google.route"));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
