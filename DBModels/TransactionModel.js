const express = require('express');
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionDate : Date,
    creditAmount : Number,
    debitAmount : Number
});

module.exports = new mongoose.model("transactionModel", transactionSchema);