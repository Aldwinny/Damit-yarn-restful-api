require("dotenv").config();

const express = require("express");

// Route imports
const userRoutes = require("./src/model/user/routes");

// Local port stuff
const app = express();
const PORT = 3000;
const ADDRESS = "192.168.100.111";

// Middleware
app.use(express.json());

app.all("*", (req, res, next) => {
  // Check the API key if matching (For app attestation)
  //   const api_key = req.query.api_key;

  //   if (api_key && api_key === process.env.APP_API_KEY) {
  //     console.log(api_key);
  //     next();
  //     return;
  //   }
  //   res.status(401).send({
  //     message: "unauthorized",
  //     kaocode: "( •̀ - •́ )",
  //   });

  // Check the JWT token (For role-based authorization)
  const jwt = require("./src/utils/token");
  const bearerHeader = req.headers.authorization;

  if (bearerHeader !== undefined) {
    const bearerToken = bearerHeader.split(" ")[1];

    try {
      var decryptToken = jwt.verifyToken(bearerToken);

      req.token = decryptToken;
      req.username = decryptToken.username;
      req.role = decryptToken.role;
      next();
    } catch (exception) {
      res.status(401).send({
        message: "unauthorized",
        info: "Invalid JWT signature, login again or resend request without Bearer token",
        kaocode: "( •̀ - •́ )",
      });
      return;
    }
  }

  // Application proceeds with role as 'general'
  next();
});

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Success!",
    kaocode: ":-)",
  });
});

// TODO: Temporary debug link
app.all("/debug", async (req, res) => {
  console.log(req.query);
  console.log(req.headers.authorization);
  console.log(req.body);
  await new Promise((resolve) =>
    setTimeout(() => {
      res.status(200).json({
        message: "debug returned success",
        output: true,
      });
      resolve();
    }, 1000)
  );
});

app.use("/api/v1/users", userRoutes);

app.use((req, res, next) => {
  // res.status(405).send({
  //   message: "To be Implemented",
  //   kaocode: "(ノ°Д°）ノ︵ ┻━┻",
  // });
  //   res.status(404).send({
  //     message: "not found",
  //     kaocode: "¯\\_(ツ)_/¯",
  //   });
});

// TODO: Change back by removing the IP
app.listen(PORT, (error) => {
  if (error) console.log(error);
  console.log(`Now running on port ${PORT}`);
});
