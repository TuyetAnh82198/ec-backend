const express = require("express");

const {
  addToCart,
  getCart,
  updateQuan,
  deleteItem,
  checkout,
  checkPaymentStatus,
  history,
  updatePaymentStatus,
  getOrderDetail,
  getAll,
} = require("../controllers/cart.js");
const isAuth = require("../middleware/isAuth.js");
const isAdmin = require("../middleware/isAdmin.js");

const route = express.Router();

route.post("/add", isAuth, addToCart);
route.get("/get", isAuth, getCart);
route.post("/update-quan", isAuth, updateQuan);
route.get("/delete-item/:id", deleteItem);
route.post("/checkout", isAuth, checkout);
route.get("/payment-status", isAuth, checkPaymentStatus);
route.get("/history", isAuth, history);
route.get("/update-payment-status", isAuth, updatePaymentStatus);
route.get("/order-detail/admin/:id", isAdmin, getOrderDetail);
route.get("/order-detail/:id", isAuth, getOrderDetail);
route.get("/get-all/:page", isAdmin, getAll);

module.exports = route;
