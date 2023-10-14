const express = require('express');
const mongoose = require('mongoose');


const transactionSchema = require(__dirname + '/TransactionModel.js')

const customerKhataSchema =  new mongoose.Schema({
    customerAadhar : Number,
    customerName : String,
    customerFatherName : String,
    customerContact : Number,
    totalAmount : Number,
    transactions : [transactionSchema]
});

module.exports = new mongoose.model("customerKhataModel", customerKhataSchema);