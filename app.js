require("dotenv").config();

const express = require("express");
const multer = require("multer");

// Route imports
const userRoutes = require("./src/model/user/routes");
const shopRoutes = require("./src/model/shop/routes");
const itemRoutes = require("./src/model/item/routes");

// Local port stuff
const app = express();
const PORT = 3000;
// let ADDRESS = "192.168.100.111";

// Multer storage
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, "SomeImage" + "." + file.originalname.split(".").pop());
  },
});

const diskStorage = multer({ storage: storage });

// Middleware
app.use(express.json());

app.all("*", (req, res, next) => {
  console.log("received api requesty");
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
  const bearerHeader =
    req.headers?.authorization ?? req.body?.headers?.authorization;

  if (bearerHeader !== undefined) {
    const bearerToken = bearerHeader.split(" ")[1];

    try {
      var decryptToken = jwt.verifyToken(bearerToken);

      req.token = decryptToken;
      req.username = decryptToken.username;
      req.role = decryptToken.role;

      next();
    } catch (exception) {
      console.log(exception);
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
app.all("/debug", diskStorage.single("image"), async (req, res) => {
  console.log(req.file);
  console.log("received");
  console.log(req.query);
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
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/items", itemRoutes);

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
