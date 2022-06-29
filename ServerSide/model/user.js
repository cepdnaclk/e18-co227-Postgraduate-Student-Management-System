/**
 * CO227 - PG Student Management System
 * Author: Jeewantha Ariyawansha
 * 
 * This file contains all the mongoDB schemas
 */

import mongoose from "mongoose";

const options = {discriminatorKey: 'kind'};

// state for the register state
const registerStatus = new mongoose.Schema({
    supervisors: {
        type: Array,
        default: []
    },
},
options
);

// Shape of the user document
const userSchema = new mongoose.Schema({
    nameWithInitials: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        unique: true
    },
    postalAddress: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    telNo: {
        type: Number,
        required: true
    },
    // TODO : These password and username should be encrypted using bcrypt
    password: {
        type: String,
        required: true
    },
    
    regState: registerStatus,

});


// Schema for the registered students
const registeredSchema = new mongoose.Schema({
    regNo: {
        type: String,
        default: "Not Set"
    },
    DOR: {
        type: Date 
    },
    degree: {
        type: String,
        enum: ['PhD', 'MPhil', 'Msc', 'MEng', 'Provisional']
    },
    studyMode: {
        type: String,
        enum: ['Full', 'Part']
    },
    researchTopic: {
        type: String
    },
    completionYear: {
        type: Number
    },
    progressLevel: {
        type: String,
        enum: ['Half Year Progress Report Submitted', 'Annual Progress Report Submitted', 'Annual Oral Presentation Completed', 'Viva Completed', 'Thesis Submitted for Review', 'Final Thesis Submitted']
    },
    dateofLastSubmission: {
        type: Date
    },
    URLtoWebsite: {
        type: String
    }
});

const prospectiveSchema = new mongoose.Schema({
    researchArea: {
        type: String,
        required: true
    },
    researchProgram: {
        type: String,
        enum: ['PhD', 'MPhil']
    },
});

// Discrimination of the registerStatus
userSchema.path('regState').discriminator('Registered' ,registeredSchema);
userSchema.path('regState').discriminator('Prospective' ,prospectiveSchema);

// Make the document model
export const UserDB = mongoose.model('userData', userSchema);
