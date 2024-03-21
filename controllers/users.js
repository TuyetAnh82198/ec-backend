const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const UserModel = require("../models/User.js");
const CartModel = require("../models/Cart.js");

//hàm xử lý việc đăng ký
const signUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = [];
      errors.array().forEach((err) => errs.push(err.msg));
      return res.status(400).json({ errs: errs[0] });
    } else {
      const existingUser = await UserModel.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ msg: "User existing!" });
      } else {
        const newUser = new UserModel({
          ...req.body,
          pass: bcrypt.hashSync(req.body.pass, 8),
          role: req.body.role ? "admin" : "client",
        });
        await newUser.save();
        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "tailieu22072023@gmail.com",
            pass: "jkal cjew kxwe kmdn",
          },
        });
        await transport.sendMail({
          from: "tailieu22072023@gmail.com",
          to: req.body.email,
          subject: "Sign up successful",
          html: `<h5>
              Congratulations! Your account registration was successful. You are
              now a member of our website. Enjoy a delightful shopping
              experience!
            </h5>`,
        });
        return res.status(201).json({ msg: "Created!" });
      }
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

//hàm xử lý việc đăng nhập
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = [];
      errors.array().forEach((err) => errs.push(err.msg));
      return res.status(400).json({ errs: errs[0] });
    } else {
      const existingUser = await UserModel.findOne({ email: req.body.email });

      if (!existingUser) {
        return res.status(400).json({ msg: "Wrong email or password!" });
      } else {
        const correctPass = bcrypt.compareSync(
          req.body.pass,
          existingUser.pass
        );
        if (!correctPass) {
          return res.status(400).json({ msg: "Wrong email or password!" });
        } else {
          existingUser.pass = undefined;
          req.session.user = existingUser;
          return res.status(400).json({ msg: "You are logged in!" });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
//hàm xử lý việc đăng nhập của admin
const loginAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = [];
      errors.array().forEach((err) => errs.push(err.msg));
      return res.status(400).json({ errs: errs[0] });
    } else {
      const existingUser = await UserModel.findOne({ email: req.body.email });
      if (!existingUser) {
        return res.status(400).json({ msg: "Wrong email or password!" });
      } else {
        const correctPass = bcrypt.compareSync(
          req.body.pass,
          existingUser.pass
        );
        if (!correctPass || existingUser.role !== "admin") {
          return res.status(400).json({ msg: "Wrong email or password!" });
        } else {
          existingUser.pass = undefined;
          req.session.user = existingUser;
          return res.status(400).json({ msg: "You are logged in!" });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
//hàm kiểm tra người dùng đã đăng nhập chưa
const checkLogin = async (req, res) => {
  try {
    if (req.session.user) {
      const cart = await CartModel.findOne(
        { email: req.session.user.email, status: "Cart" },
        "products"
      );
      return res.status(200).json({
        msg: "You are logged in.",
        fullName: req.session.user.fullName,
        numberOfItems: cart ? cart.products.length : 0,
      });
    } else {
      return res.status(400).json({ msg: "Have not been logged in yet." });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
//hàm kiểm tra người dùng đã đăng nhập chưa, và người dùng này phải có vai trò là admin
const checkLoginAdmin = async (req, res) => {
  try {
    if (req.session.user) {
      if (req.session.user.role === "admin") {
        return res.status(200).json({
          msg: "You are logged in.",
        });
      }
      return res.status(400).json({ msg: "Have not been logged in yet." });
    } else {
      return res.status(400).json({ msg: "Have not been logged in yet." });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
//hàm xử lý việc đăng xuất
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({ err: err.message });
    } else {
      res.clearCookie("connect.sid");
      return res.status(200).json({ msg: "You are logged out." });
    }
  });
};

//hàm trả về tổng số lượng các mục ở Dashboard của trang admin
const getTotal = async (req, res) => {
  try {
    const cart = await CartModel.find({
      status: "Paid",
    }).populate("products.productId");
    const billArr = [];
    let bill;
    for (let i = 0; i < cart.length; i++) {
      bill = cart[i].products
        .map((pd) => pd.quan * pd.productId.price)
        .reduce((acc, price) => acc + price, 0);
      bill >= 75 ? billArr.push(bill) : billArr.push(bill + 7.95);
      bill = 0;
    }

    const cartByMonth = [];
    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    cart.forEach((item) => {
      if (item.date.split("-")[1] == currentMonth) {
        cartByMonth.push(item);
      }
    });
    const billByMonthArr = [];
    for (let i = 0; i < cartByMonth.length; i++) {
      bill = cartByMonth[i].products
        .map((pd) => pd.quan * pd.productId.price)
        .reduce((acc, price) => acc + price, 0);
      bill >= 75 ? billByMonthArr.push(bill) : billByMonthArr.push(bill + 7.95);
      bill = 0;
    }

    return res.status(200).json({
      users: await UserModel.countDocuments(),
      orders: await CartModel.countDocuments(),
      earningsOfMonth: billByMonthArr.reduce((acc, price) => acc + price, 0),
      totalEarnings: billArr.reduce((acc, price) => acc + price, 0),
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  signUp,
  login,
  checkLogin,
  logout,
  getTotal,
  checkLoginAdmin,
  loginAdmin,
};
