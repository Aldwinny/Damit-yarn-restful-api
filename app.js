const express = require("express");
const app = express();

// Local port stuff
const PORT = 8080;

// Middleware
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Now running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Success!",
  });
});
