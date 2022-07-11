/**
 * CO227 - PG Student Management System
 * Author: Jeewantha Ariyawansha
 *
 * This file contains the all the api controllings in the app
 */

 import Joi from "joi";
 import bcrypt from "bcrypt";
 import jwt from "jsonwebtoken";
 import dotenv from "dotenv";
 import { prospectiveUser, registeredUser, UserDB } from "../model/user.js";
 import mongoose from "mongoose";
 import { RegisteredDB } from "../model/registeredUser.js";
 import { StaffDB } from "../model/staff.js";
 import { MailSender } from "../mailSender.js";
 import moment from "moment";
 import sendEmail from "../utils/email.js";
 import crypto from "crypto";
 
 dotenv.config({ path: "config.env" });
 
 export const signUp = async (req, res) => {
   // checking user entered data
   const { error } = validateUser(req.body);
 
   if (error) {
     res.status(400).send(error.details[0].message);
     return;
   } else {
     // Find if there is that username
     const useremail = req.body.email;
     const userExists = await UserDB.findOne({ email: useremail });
     if (userExists) {
       return res.status(409).send({ message: "User already exists" });
     }
 
     try {
       let user;
       // encript the password to send to the database
       bcrypt.hash(req.body.password, 10, (error, hashed) => {
         if (error) {
           return res.status(401).send({
             message: "Password encryption failed",
             error: error.message,
           });
         }
 
         // Check the register status of user
         if (req.body.regState === "Registered") {
           user = new registeredUser({
             nameWithInitials: req.body.nameWithInitials,
             fullName: req.body.fullName,
             postalAddress: req.body.postalAddress,
             email: req.body.email,
             telNo: req.body.telNo,
             password: hashed,
             supervisors: req.body.supervisors,
             regNo: req.body.regNo,
             DOR: req.body.DOR,
             degree: req.body.degree,
             studyMode: req.body.studyMode,
             researchTopic: req.body.researchTopic,
             completionYear: req.body.completionYear,
             progressLevel: req.body.progressLevel,
             dateofLastSubmission: req.body.dateofLastSubmission,
             URLtoWebsite: req.body.URLtoWebsite,
           });
         } else if (req.body.regState === "Prospective") {
           user = new prospectiveUser({
             nameWithInitials: req.body.nameWithInitials,
             fullName: req.body.fullName,
             postalAddress: req.body.postalAddress,
             email: req.body.email,
             telNo: req.body.telNo,
             password: hashed,
             supervisors: req.body.supervisors,
             researchArea: req.body.researchArea,
             reseachProgram: req.body.reseachProgram,
             state: req.body.state
           });
         }
 
         // save the data in the database
         user
           .save(user)
           .then(async (data) => {
 
             // Make link to send to admin to access user data
             const approvalLink = "http://localhost:3001/admin/approve";
             req.session.current_url = approvalLink;
             console.log(approvalLink);
 
             const admin = await StaffDB.findOne({role: "admin"});
             let emailList = [admin.email];
 
             // Sending Email to the admin informing that new user is registered
             const regDate = moment().add(5, "s").format();
             new MailSender(emailList, regDate, user.nameWithInitials, "admin", approvalLink).sendEmail();
 
             res.status(208).send({message: 'Data inserted successfully', user});            
           })
           .catch((err) => {
             res.status(500).send({
               message: err.message || "Some error occured",
             });
           });
       });
     } catch (err) {
       res.status(401).send({ message: "User not created", error: err.message });
     }
   }
 };
 
 // Function to approve student. This passes the data to regstered database
 export const approveStudent = async (req, res) => {
   const userID = req.params.id;
 
   if (!userID) {
     return res.status(400).send({ message: "User not found" });
   }
 
   // Get user details from the userDB
   const user = await UserDB.findById(userID);
   const RegDate = new Date();
   if (user) {
     await RegisteredDB.create({
       nameWithInitials: user.nameWithInitials,
       fullName: user.fullName,
       postalAddress: user.postalAddress,
       email: user.email,
       telNo: user.telNo,
       password: user.password,
       supervisors: user.supervisors,
       researchArea: user.researchArea,
       reseachProgram: user.reseachProgram,
       RegisteredDate: RegDate,
     });
     user.state = 'approved';
     await user.save();
     res.status(200).send({ message: "User  approved by admin" });
     /**@ToDo Send Email to user that he is approved */
   } else {
     res.status(400).send({ message: "There is no user with that ID" });
   }
 };
 

 function validateUser(userData) {
   // Joi Schema for checking sign up data
   const schema = Joi.object({
     nameWithInitials: Joi.string().min(3).required(),
     fullName: Joi.string().required(),
     postalAddress: Joi.string().required(),
     email: Joi.string().email({ minDomainSegments: 2 }).required(),
     telNo: Joi.number().min(10).required(),
     password: Joi.string().required(),
     regState: Joi.string().valid("Registered", "Prospective"),
     regNo: Joi.string(),
     DOR: Joi.date().raw(),
     degree: Joi.string().valid("PhD", "MPhil", "Msc", "MEng", "Provisional"),
     studyMode: Joi.string().valid("Full", "Part"),
     /* supervisors: Joi.array().items(Joi.string()) */ /**@Todo Get array of supervisors from frontend */
     supervisors: Joi.string(),
     researchTopic: Joi.string(),
     completionYear: Joi.number().min(4),
     progressLevel: Joi.string().valid(
       "Half Year Progress Report Submitted",
       "Annual Progress Report Submitted",
       "Annual Oral Presentation Completed",
       "Viva Completed",
       "Thesis Submitted for Review",
       "Final Thesis Submitted"
     ),
     dateofLastSubmission: Joi.date(),
     urlToWebsite: Joi.string(),
     researchArea: Joi.string(),
     reseachProgram: Joi.string().valid("PhD", "MPhil"),
   });
 
   return schema.validate(userData);
 }

 export const addStaff = async (req, res) => {
    // Find if there is that email
    const email = req.body.email;
    
    console.log(req.body);

    const userExists = await StaffDB.findOne({ email: email });
    if (userExists) {
      return res.status(409).send({ message: "User already exists1" });
    }

    // Make the model
    const staff = new StaffDB({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    })

    staff
      .save(staff)
      .then( data =>{
        let emailList = [data.email];
        // Sending Email to the admin informing that new user is registered
        const regDate = moment().add(5, "s").format();
        new MailSender(emailList, regDate, 'Administrator', "staffAdd", "").sendEmail();

        res.status(208).send({message: `${data.role} added successfully`, data});
      })
      .catch(err=>{
        res.status(500).send({
            message: err.message || "Some error ocurred"
        });
    });
  };


  // Controller function for fogot password
  export const forgotPassword = async (req, res, next) => {
    // 1) get user based on POSTed email
    const user = await RegisteredDB.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({message: "There is no user with this email"});
    }
  
    // 2) Generate the random reset token
    const resetToken = createPasswordResetToken(user);
    //   Save this doc to the database
    // turn off all the validators
    await user.save({ validateBeforeSave: false });
  
    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/user/resetPassword/${resetToken}`;         
  
    const message = `Reset You password from here: ${resetURL}.\nIf you did'nt forget your password please ignore this..`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token.Valid only for 10 mins',
        message,
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      // In any case of error reset these
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      return res.status(500).json({message: "Somthing error  occured with sending email"});
    }
  };


// Function for  create reset password token
const createPasswordResetToken = (user) => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  // will be expired after 10 mins
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // we need to send the plain text via email
  return resetToken;
};


  // Controller function for reset password
export const resetPassword = async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await RegisteredDB.findOne({
    passwordResetToken: hashedToken,
    // Check whether the link has expired
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If the token has not expired  , and there is user  , set the new password
  if (!user) {
    return res.status(400).json({message: "Token is invalid or has expired!"})
  }

  console.log("ERROR POINT");
  // console.log(hashedPW);
  //   Update the password
  user.password = await bcrypt.hash(req.body.password, 10);
  // user.passwordConfirm = req.body.passwordConfirm;

  //   delete the passwordResetToken
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //   save the modified doc
  await user.save();
  // 3) update ChangedPasswordAt property for the user
  // 4) log the user in , send JWT
  // createSendToken(user, 200, res);
  res.status(200).json({message: "Password update successful"});

  next();
};

// update the logged user password
export const updatePassword = async (req, res, next) => {
  // 1) get the user from the collection
  const user = await RegisteredDB.findById(req.user.id);

  // 2) check if the POSTed current password is correct
  if (!(await bcrypt.compare(req.body.passwordCurrent, user.password))) {
    return res.status(401).json({message: 'Your current password is wrong!'});
  }
  // 3) If so , update the password
  user.password = await bcrypt.hash(req.body.password, 10);
  // user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in , send the JWT
  res.status(200).json({message: "Password change successfull"});
};