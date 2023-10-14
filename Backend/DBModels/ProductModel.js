const express = require('express');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    chemicalName : String,
    companyName : String,
    typeOfProduct : String,
    price : Number,
    quantity : Number,
    subTotal : Number
});

module.exports = new mongoose.model("productModel", productSchema)