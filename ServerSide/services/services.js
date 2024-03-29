/**
 * CO227 - PG Student Management System
 * Author: Jeewantha Ariyawansha
 *
 * This file contains the all services(Rendering) of the application
 */

import express from "express";

//// This is for render html...This should be deleted when fontend connected
import path from "path";
import { fileURLToPath } from "url";
import { RegisteredDB } from "../model/registeredUser.js";
import { UserDB } from "../model/user.js";
import logger from "../logger.js";
import { StaffDB } from "../model/staff.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
////

export const gotologin = async (req, res) => {
  res.sendFile(path.join(__dirname, "../view/login.html"));
  res.render("login.ejs" /* , {name: req.user.name, role: req.user.role} */);

  // const user = await RegisteredDB.findOne(
  //   { email: req.body.email },
  //   "-password"
  // );

  // res.status(200).json({
  //   status: "success",
  //   user,
  // });
};

export const gotosignup = (req, res) => {
  res.render("signup.ejs");
};

export const getUser = async (req, res) => {
  // Get user id from the link
  const userID = req.user.id;
  logger.info("id from get user function" + userID);
  // Get user from the userdata base without password
  const unReg = await UserDB.findById(userID, "-password");
  const Reg = await RegisteredDB.findById(userID, "-password");
  const staffReg = await StaffDB.findById(userID, "-password");

  let user = unReg || Reg || staffReg;

  if (user) {
    // res.render("unRegUser", { userData: user });
    return res.status(200).json(user);
    //return res.status(200).json(user);
  } else {
    return res.status(404).json({ message: "User not found" });
  }
};

export const getToApprove = async (req, res) => {
  // get all users from the database
  const users = await UserDB.find({ state: "not approved" });
  if (!users) {
    res.status(404).send({ message: "There are no any unapproved students" });
  }
  res.status(200).json(users);
};

// Method to render a approve page
export const gotoApprove = (req, res) => {
  res.render("approve");
};

// Method to render a approve page
export const getForgotPW = (req, res) => {
  res.render("forgot");
};
