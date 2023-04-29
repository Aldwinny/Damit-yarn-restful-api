const { Router } = require("express");
const controller = require("./controller");

const router = Router();

// CREATE routes

// READ routes
router.get("/", controller.getItems);
router.get("/:id", controller.getItemsByID);
router.get("/reviews/:id", controller.getItemReviews);
router.post("/cart", controller.addToCart);

// UPDATE routes

// DELETE routes

module.exports = router;
