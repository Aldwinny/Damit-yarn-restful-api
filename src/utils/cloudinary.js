require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (imageData, aspect = "square") => {
  let filename = crypto
    .createHash("md5")
    .update(imageData.originalname)
    .digest("hex");

  console.log(filename);

  // Upload
  const res = cloudinary.uploader.upload(imageData.path, {
    public_id: filename,
  });

  await res
    .then((data) => {
      console.log("internal res", data);
      console.log(data.secure_url);
    })
    .catch((err) => {
      console.log("internal", err);
    });

  // Generate
  const url = cloudinary.url(filename, {
    width: aspect === "square" ? 700 : 1000,
    height: aspect === "square" ? 700 : 750,
    crop: "fill",
  });

  return url;
};

const deleteImage = (link) => {
  const name = link.split("/").pop();

  cloudinary.uploader.destroy(name, (result) => {
    console.log("Successfully deleted old photo/s");
  });
};

module.exports = { uploadImage, deleteImage };
