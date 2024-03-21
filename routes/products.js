const express = require("express");
const multer = require("multer");

const {
  getProducts,
  getProductsByType,
  getProductsByBrand,
  getDetail,
  deletePd,
  deleteMany,
  addProduct,
  getDetailAdminPage,
  updateProduct,
} = require("../controllers/products.js");
const isAdmin = require("../middleware/isAdmin.js");

const route = express.Router();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + file.originalname + "-" + Date.now());
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

route.get("/get-top-8", getProducts);
route.get("/get/type/:type/:page", getProductsByType);
route.get("/get/brand/:brand/:page", getProductsByBrand);
route.get("/detail/admin/:id", isAdmin, getDetailAdminPage);
route.get("/detail/:id", getDetail);
route.get("/delete/:id", isAdmin, deletePd);
route.post("/delete", isAdmin, deleteMany);
route.post("/add", isAdmin, upload.array("images", 3), addProduct);
route.post("/update/:id", isAdmin, updateProduct);

module.exports = route;
