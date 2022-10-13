const mongoose = require('mongoose');



const {billSchema} = require(__dirname + '/BillModel.js');
const {customerKhataSchema} = require(__dirname + '/KhataModel.js');
const userSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true
        },                                                            //username is same as user email
        fullName : String,
        contactNumber : {
            type :  Number,
            unique : true,
            required : true
        },
        shopName : String,
        shopAddress : String,
        shopLicenceNumber : Number,
        userPlan : Number,
        password : String,
        billBook : [billSchema],
        khataBook : [customerKhataSchema]
    }     
);

module.exports = new mongoose.model("User", userSchema);