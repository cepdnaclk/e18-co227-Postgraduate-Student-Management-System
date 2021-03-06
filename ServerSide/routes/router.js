/**
 * CO227 - PG Student Management System
 * Author: Jeewantha Ariyawansha
 *
 * This file contains the all the routes of application
 */

import express from "express";
import {
  getForgotPW,
  getToApprove,
  getUser,
  gotoApprove,
  gotologin,
  gotosignup,
} from "../services/services.js";
import {
  addStaff,
  approveStudent,
  forgotPassword,
  resetPassword,
  signUp,
  submission,
  updatePassword,
  updatePhotoData,
  uploadUserPhoto,
} from "../controller/controller.js";

import { isAdmin, isLogged } from "../Middleware/auth.js";
import passport from "passport";
import multer from "multer";
import { studentSubmission, userDocUpload } from "../utils/storages.js";
import { RegisteredDB } from "../model/registeredUser.js";

// Get Router from express
const route = express.Router();

// ==========================================================================================================================
// ///////////////////////////////////////////////////
route.post("/sub", (req, res, next) => {
  console.log(req.body);
  res.status(200).json({
    message: "DONE!",
  });

  next();
});
// ////////////////////////////////////////////////////
/**
 * @description login Route
 * @method GET
 */
route.get("/", isLogged, (req, res) => {
  /////
  res.render("index.ejs", { user: req.user });
});

///////////////////////////////////// ADMIN //////////////////////////////////////////////////
/**
 * @description Route to go to user approvement page
 * @method GET
 */
route.post("/admin/approve", isAdmin, approveStudent); /////////

/**
 * @description Rouute to add new staff member for the database
 * @method POST
 */
route.post("/admin/addStaff", /* isAdmin, */ addStaff);

/**
 * @descripion Route to get unregistered users
 * @method GET
 */
route.get("/admin/toApprove", isAdmin, getToApprove); ///////

/**
 * @descripion Route to go to the approve page
 * @method GET
 */
route.get("/admin/approve/:id", isAdmin, gotoApprove); ////////

/////////////// Only for Demo ////////////////
// To Check admin
route.get("/admin", isAdmin, (req, res) => {
  ////////
  res.send("You are an admin");
});
////////////////////////////////////////////////

///////////////////////////////////// USER //////////////////////////////////////////////////

/**
 * @description Rouute to logout
 * @method GET
 */
route.post("/user/logout", async (req, res) => {
  console.log("logout");
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// route.get("/user/login", gotologin); ////////

route.post(
  "/user/login",
  passport.authenticate("local", {
    ////////
    successRedirect: "/", // If success go to home
    failureRedirect: "/user/login", // If fail to login, go back to login
    failureFlash: true, // Display message to user (that we have given in initialize function)
  })
);

/**
 * @description Route to the signup page
 * @method GET
 */
// route.get("/user/signup", gotosignup); /////////

/**
 * @description Route to register an user
 * @method POST
 */
route.post("/user/signup", userDocUpload.single("docs"), signUp); ////////

/**
 * @description Route to get user details with given id. Only admin can get information of  unregistered student
 * @method GET
 */
route.get("/user/profile", isLogged, getUser); ////////

/**
 * @description Rouute to forgot password
 * @method POST
 */
route.get("/forgotPassword", (req, res) => {
  ///////
  res.render("forgot");
});

/**
 * @description Rouute to forgot password
 * @method POST
 */
route.post("/user/forgotPassword", forgotPassword); ///////

/**
 * @description Rouute to forgot password
 * @method POST
 */
route.patch("/user/resetPassword/:token", resetPassword); //////

/**
 * @description Route to update password
 * @method PATCH
 */
route.patch("/user/updatePassword/", isLogged, updatePassword); //////

/**
 * @description Route to upload profile picture
 * @mehtod PATCH
 */
route.patch("/user/uploadpp", isLogged, uploadUserPhoto, updatePhotoData);

/**
 * @description Route to upload user submissions
 * @mehtod PATCH
 */
route.post(
  "/user/submit",
  isLogged,
  studentSubmission.single("submission"),
  submission
);

///////////////////////////////////// AUTH //////////////////////////////////////////////////
/**
 * @description Rouute to login with google
 * @method POST
 */
route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
); //////

/**
 * @description Rouute to after login with google
 * @method POST
 */
route.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    //////
    successRedirect: "/",
    failureRedirect: "/auth/google/failure",
  })
);

/**
 * @description Route to after login with google if login is failed
 * @method POST
 */
route.get("/auth/google/failure", (req, res) => {
  //////
  res.render("AuthFail.ejs");
});

export default route;
