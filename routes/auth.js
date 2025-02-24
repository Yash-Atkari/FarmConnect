const express = require("express");
const passport = require("passport");
const User = require("../models/user"); 
const router = express.Router();

// Render Sign-up Page
router.get("/signup", (req, res) => {
    res.render("auth/signup");
});

// Render Login Page
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// Register User
router.post("/signup", async (req, res) => {
    try {
      const { username, email, role, password } = req.body;
      const newUser = new User({ username, email, role });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        res.send("You have registered and logged in");
        // req.flash("success_msg", "Registration successful. Welcome to FarmConnect!");
        // res.redirect("/dashboard");
    });
    } catch (err) {
        res.send(err.message);
    //   req.flash("error_msg", "Error: " + err.message);
    //   res.redirect("/register");
    }
});

// Login User
router.post("/login", passport.authenticate("local", {
    // successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
    res.send("You have logged in");
});

// Logout User
router.get("/logout", (req, res) => {
    req.logout((err) => {
    if(err) {
        return next(err);
    }
    res.send("You have logged out");
    //   req.flash("success_msg", "You have been logged out.");
    //   res.redirect("/login");
    });
});

module.exports = router;
