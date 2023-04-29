const { Router } = require("express");
const controller = require("./controller");

const router = Router();

// CREATE routes
router.post("/", controller.addUser);

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
