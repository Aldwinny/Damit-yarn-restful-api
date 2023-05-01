const { Router } = require("express");
const controller = require("./controller");

const router = Router();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, "image" + "." + file.originalname.split(".").pop());
  },
});

const diskStorage = multer({ storage: storage });

// CREATE routes
router.post("/", controller.addUser);
router.post("/upload", diskStorage.single("image"), controller.uploadUserPhoto);

// READ routes
router.get("/", controller.getUsers);
router.get("/:id", controller.getUserByID);
router.post("/login", controller.loginUser);
router.post("/verify", controller.verifyPassword);

// UPDATE routes
router.put("/:id", controller.updateUser);

// DELETE routes
router.delete("/:id", controller.deleteUser);

module.exports = router;
