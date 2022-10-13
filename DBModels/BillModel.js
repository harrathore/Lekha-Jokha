const express = require('express');
const mongoose = require('mongoose');

// console.log(__dirname + '/ProductModel.js');

const productSchema = require(__dirname + '/ProductModel.js')

const billSchema = new mongoose.Schema({
    billBookNumber : Number,
    billNumber : Number,
    customerName : String,
    customerContact : Number,
    totalAmount :  Number,
    invoiceDate : Date,
   // allProducts : [productSchema]
});

module.exports = new mongoose.model("billModel", billSchema);