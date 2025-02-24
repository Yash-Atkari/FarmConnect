const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const path = require("path");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const flash = require("connect-flash");

const Product = require("./models/product");
const Order = require("./models/order");

connectDB()
    .then(() => {
        console.log("Connected to DB!");
    })
    .catch((err) => {
        console.log("DB Connection Failed:", err);
    });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs"); // EJS setup
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const authRouter = require("./routes/auth");

const sessionOptions = {
    secret: "mysecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(flash());
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    // res.locals.error = req.flash("error");
    next();
});

app.use("/auth", authRouter);

// Dashboard Page
app.get("/farmconnect", async (req, res) => {
    if (req.isAuthenticated()) {
      try {
        const user = req.user;  // Assuming `req.user` is populated via passport
        let products = [];
        let orders = [];
        
        if (user.role === "farmer") {
          products = await Product.find({ farmerId: user._id });
        } else if (user.role === "buyer") {
          orders = await Order.find({ buyerId: user._id }).populate('productId');
        }
        
        res.render("user/dashboard", { user, products, orders });
      } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong", err);
      }
    } else {
      res.redirect("/auth/login");
    }
});

// Marketplace Page
app.get("/marketplace", async (req, res) => {
  try {
    const products = await Product.find().populate("farmerId", "username");
    res.render("product/marketplace", { products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Add Product Page
app.get("/products/add", (req, res) => res.render("product/add-product"));

// Orders Page
app.get("/orders", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth/login"); // Redirect to login if not authenticated
    }

    let orders;

    if (req.user.role === "buyer") {
      // Fetch orders where the logged-in user is the buyer
      orders = await Order.find({ buyerId: req.user._id })
        .populate({
          path: "productId",
          populate: { path: "farmerId", select: "username" } // Ensure farmerId is populated
        });
    } else {
      // Fetch orders where the logged-in user is the seller (farmer)
      const userProducts = await Product.find({ farmerId: req.user._id });
      const productIds = userProducts.map(product => product._id);
      
      orders = await Order.find({ productId: { $in: productIds } })
        .populate("productId")
        .populate("buyerId", "username");
    }

    res.render("order/orders", { user: req.user, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Profile Page
app.get("/profile", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth/login"); // Redirect to login if not authenticated
    }
    res.render("user/profile", { user: req.user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(8080, () => {
    console.log("App is listening on http://localhost:8080/farmconnect");
});
