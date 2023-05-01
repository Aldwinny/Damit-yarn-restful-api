const { Router } = require("express");
const controller = require("./controller");

const router = Router();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, "itemimage" + "." + file.originalname.split(".").pop());
  },
});

const diskStorage = multer({ storage: storage });

// CREATE routes
router.post("/", controller.createItemData);
router.post(
  "/upload",
  diskStorage.single("image"),
  controller.uploadImagePhoto
);
router.post("/cart", controller.addToCart);
router.post("/transaction", controller.addTransaction);

// READ routes
router.get("/cart", controller.getCart);
router.get("/likes", controller.getLikes);
router.get("/transaction", controller.getTransactionByID);
router.get("/", controller.getItems);
router.get("/reviews/:id", controller.getItemReviews);
router.get("/:id", controller.getItemsByID);

// UPDATE routes
router.put("/cart", controller.updateCart);
router.put("/:id", controller.updateItemData);

// DELETE routes
router.delete("/cart", controller.removeCart);
router.delete("/upload", controller.deleteImagePhoto);
router.delete("/:id", controller.deleteItemData);

module.exports = router;
