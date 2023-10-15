
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const path = require('path');
const Chart = require('chart.js');


require('dotenv').config();

const port = process.env.PORT || 3000;
const mongoDbUrl = process.env.MONGODB_URL;


const app = express();

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({extended: true}));


app.set('views', path.join(__dirname, '../Frontend/views'));
app.set('view engine', 'ejs');





//Connecting to Databse

mongoose.set('strictQuery', false); // Prepare for the change in Mongoose 7

mongoose.connect(mongoDbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const database = mongoose.connection;

database.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

database.once('open', () => {
  console.log('Database Connected');
});

// mongoose.connect(mongoDbUrl);

// const database = mongoose.connection
// database.on('error', (error) => {
//   console.log(error)
// })

// database.once('connected', () => {
//   console.log('Database Connected');
// })



//Creating Schemas and Models 

const productSchema = mongoose.Schema({
        chemicalName : String,
        companyName : String,
        typeOfProduct : String,
        price : Number,
        quantity : Number,
        subTotal : Number
});

//const productModel = require('./DBModels/ProductModel')

const transactionSchema = mongoose.Schema({
    transactionDate : Date,
    creditAmount : Number,
    debitAmount : Number
});

//const transactionModel = mongoose.model("transactionModel", transactionSchema);


const billSchema = mongoose.Schema({
        billBookNumber : Number,
        billNumber : Number,
        customerName : String,
        customerContact : Number,
        totalAmount :  Number,
        invoiceDate : Date,
        allProducts : [productSchema]
});

//const billModel = mongoose.model("billModel", billSchema);

const customerKhataSchema =  mongoose.Schema({
    customerAadhar : {
        type : Number,
        required : true
    },
    customerName : String,
    customerFatherName : String,
    customerContact : Number,
    totalAmount : Number,
    transactions : [transactionSchema]
});

//const customerKhataModel = mongoose.model("customerKhataModel", customerKhataSchema);

const userSchema = mongoose.Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true
        },                                                            //username is same as user email
        fullName : String,
        contactNumber : {
            type :  Number,
            // unique : true,
            required : true
        },
        shopName : String,
        shopAddress : String,
        shopLicenceNumber : Number,
        userPlan : Number,
        password : {
            type : String,
            required : true
        },
        billBook : [billSchema],
        khataBook : [customerKhataSchema]
    }     
);
     

const User = mongoose.model('User', userSchema);


const {generateToken, verifyJwt} = require('./Utility/jwt');  ///Import function from other module


//******************************************** GET REQUEST *************************************************

app.get("/", function(req, res){
    res.render("pages/home");
});

app.get("/login", function(req, res){
    res.render("pages/login");
});

app.get("/register", function(req, res){
    res.render("pages/register");
});


app.get("/profile", async function(req, res){

    const token = req.cookies.access_token;
    if (!token) {
       return res.status(403).json({message : "You are not authorize... Please login first"});
    }else{
        const Verified = await verifyJwt(token);
        const userEmail = Verified.email;
        try{
            const data = await User.findOne({username : userEmail});
            if(data){
              return res.render("pages/profile", {shopName : data.shopName, fullName : data.fullName,  contactNo : data.contactNumber, shopAddress: data.shopAddress, licenceNumber : data.shopLicenceNumber});
            }
        }catch(error){
            return res.status(400).json({message : error.message});
        }
    }
});

app.get("/billEntry", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        return res.redirect('login')
    }
    const verified = await verifyJwt(token);
    if(verified){
        const username = verified.email;
        const data = await User.findOne({username : username});
        if(data){
          res.render("pages/billEntry", {shopname : data.shopName, allBills : data.billBook});
        }
    }else{
        res.status(400).redirect('login');
    }    
})

app.get("/khataEntry", async function(req, res){

    const token = req.cookies.access_token;
    if(!token){
        return res.redirect('login')
    }
    const verified = await verifyJwt(token);
    if(verified){
        const username = verified.email;
        const data = await User.findOne({username : username});
        res.render('pages/khataEntry', {shopname : data.shopName, allKhatas : data.khataBook})
    }
    else{
       return res.status(403).json({message : "You are not authorize... Please login first"});
    }
    
})

app.get("/khataUpdate", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        return res.redirect('login')
    }
    const verified = await verifyJwt(token);
    if (verified) {
         res.render("pages/khataUpdate");
    }else{
        return res.status(403).json({message : "You are not authorize... Please login first"});

    }
    
})

const {getTodaysReport, getWeeklyReport, getProductWiseSales, getAllProductDayWise, getDataWrtTypeOfProduct, getCompanyWiseReport} = require('./Utility/getReports');

app.get('/report', async function(req, res){
    const token = req.cookies.access_token;
    if (!token) {
       return res.status(403).json({message : "You are not authorize... Please login first"});
    }else{
        const Verified = await verifyJwt(token);
        const userEmail = Verified.email;
        try{
            const data = await User.findOne({username : userEmail});
            const allBills =  data.billBook;
            const todaysData = await getTodaysReport(allBills);         //Getting all todays data needs to render

            const weeklySalesData = await getWeeklyReport(allBills, 7);

            const monthlySalesData = await getWeeklyReport(allBills, 30);

            const productTypeSalesData = await getProductWiseSales(allBills);

            //Get product wise last & days sales
            //First get date wise all reports with all product sold on that day

            const weeklyAllProductSalesData = await getAllProductDayWise(allBills)
           
            const productTypes = [
                "seeds",
                "rodenticides",
                "biopesticides",
                "insecticides",
                "weedicides",
                "syntheticfertilizer",
                "growthregulators",
                "fungicides",
                "biofertilizers",
                "herbicides",
              ];

            const resArray = [];
            for(let i=0; i<10; ++i){
               const res = await getCompanyWiseReport(allBills, productTypes[i]);
               resArray.push(res);
            }
            console.log(resArray)

            let arr = new Array();
            for(let i=0; i<7; ++i){
                 const y = await getDataWrtTypeOfProduct(weeklyAllProductSalesData[i]);
                 arr.push(y);
            }
           

            res.render('pages/reportPage', {today : todaysData, weeklySales : weeklySalesData, monthlySales : monthlySalesData, productSales : productTypeSalesData, arr : arr});

        }catch(error){
            return res.status(400).json({message : error.message});
        }
    }
})

app.get("/completeBill", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        return res.redirect('login')
    }
    const verified = await verifyJwt(token);
    if (verified) {
        res.render("pages/completeBill");
    }else{
        return res.status(403).json({message : "You are not authorize... Please login first"});
    }
    
})

app.get("/khataDetails", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        return res.redirect('login')
    }
    const verified = await verifyJwt(token);
    if (verified) {
        res.render("pages/khataDetails")
    }else{
        return res.status(403).json({message : "You are not authorize... Please login first"});
    }
    
})

app.get("/todaysData", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        res.redirect('login')
    }
    const verified = await verifyJwt(token);
    if (verified) {
        const userFound = await User.findOne({username : verified.email});
        let len = (userFound.khataBook).length;
        let len2 = ((userFound.khataBook[0]).transactions).length;
        let arr = [];
        for(let i=0; i<len2; i++){
            if(((userFound.khataBook[0]).transactions[i]).transactionDate.getDate() === new Date().getDate()){
                arr.push((userFound.khataBook[0]).transactions[i]);
            }
        }
        res.send("The length of data is : " + arr);
    }else{
        return res.status(403).json({message : "You are not authorize... Please login first"});
    }  
})

//******************************************** POST REQUEST *************************************************


app.post("/register", async function(req, res){

    const email = req.body.email;
    const emailConfirm = req.body.confirm_email;

    const password = req.body.password;
    const passwordC = req.body.passwordC;
    
    if(email === null){
        res.send("Your email cant't be empty");
    }else if(password === null){
        res.send("Your Password cant't be Empty.. Please Ensure a long Strong password")
    }
    else if(email.toLowerCase() !== emailConfirm.toLowerCase()){
       res.send("Your email is not same please check it")
    }else if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)){
       res.send("Invalid Mail Please enter valid mail")
    }else if(password !== passwordC){
       res.send("Your Password and Confirm Password doesnt match Please correct it");
    }else{
       const username = email.toLowerCase();
       const userfullName = req.body.fullname;
       const userContact = req.body.contactNo;
       const shopname = req.body.shopname;
       const shopAddresss = req.body.shopaddress;
       const shopLicenceNo = req.body.shopLicenceNumber;
       try{
            const user = new User({
                username : username,
                fullName : userfullName,
                contactNumber : userContact,
                shopName : shopname,
                shopAddress : shopAddresss,
                shopLicenceNumber : shopLicenceNo,
                userPlan : 0,
                password : password,                     //Hashing is remained
                billBook : [],
                khataBook : [],
            });
            const usersaved = await user.save();
        
            const token = await generateToken(username);
            
            return  res.cookie("access_token", token, {
                httpOnly: true
            }).redirect("profile");

       }catch(error){
            res.status(401).json({message : error.message});
        }
           
    }
});

app.post('/login', async function(req, res){
    const inputUsername = req.body.username;
    const inputPassword = req.body.password; 
   
    try{
        const savedUser = await User.findOne({username : inputUsername});
        if(!savedUser){
            return res.status(404).json({message : "User with this name does not exist...."});
        }else if(savedUser.password !== inputPassword){
            return res.status(404).json({message : "user Password is not correct"});
        }else{
            const token = await generateToken(inputUsername);
          
            return  res.cookie("access_token", token, {
                httpOnly: true
            }).redirect("profile");

        }
    }catch(error){
        return res.status(400).json({message2 : error.message});
    }
})

app.post("/profile", async function(req, res){
    const token = req.cookies.access_token;
    const verified = await verifyJwt(token);
    if(verified){
        const username = verified.email;
        console.log(username);
        try{
            const newObj = ({
                fullName : req.body.fullname,
                shopName : req.body.shopname,
                contactNumber : req.body.mobile,
                shopAddress : req.body.address,
                shopLicenceNumber : req.body.licenceNumber 
            });

            const updatedUser = await User.findOneAndUpdate({username : username}, newObj);
            res.redirect('profile');             //Redirected to profile page so changes will be visible instantly

        }catch(error){
            res.status(404).json({message : error.message});
        }
    }
})

app.post("/billEntry", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        return res.redirect('login');
    }
    const verified = await verifyJwt(token);
    if(verified){
        const userEmail = verified.email;
        let productArr = [];
        for(let i=0; i<2; i++){
            const newProd = ({
                chemicalName : req.body.chemicalName[i],
                companyName : req.body.companyName[i],
                typeOfProduct : req.body.productType[i],
                price : req.body.price[i],
                quantity : req.body.quantity[i],
                subTotal : req.body.subTotal[i]
            });
            productArr.push(newProd);
        }
    
        try{
            const newBillEntry = ({
                billBookNumber : req.body.billBookNumber,
                billNumber : req.body.billNumber,
                customerName : req.body.customerName,
                customerContact : req.body.customerContact,
                totalAmount :  req.body.totalAmount,
                invoiceDate : new Date(),
                allProducts : productArr
            });
            const updatedData = await User.findOneAndUpdate({username : userEmail}, {$push : {billBook : newBillEntry}});
            res.redirect('billEntry');
    
        }catch(error){
            req.status(400).json({message : error.message});
        }
    }else{
        res.redirect('login')
    }
    
})

app.post("/khataEntry", async function(req, res){
    const token = req.cookies.access_token;
    if(!token){
        return res.status(400).redirect('login');
    }
    const verified = await verifyJwt(token);
    if(verified){
        const userEmail = verified.email;

        let ifAlreadyAccount = null;
        //ifAlreadyAccount = await database.users
        if(ifAlreadyAccount){
            console.log("Customer with this aadhar number already exist....")
        }
        try{
            let dateStr = req.body.Date;
            let yr = dateStr.substring(0, 4);
            let mn = dateStr.substring(5, 7);
            let dy = dateStr.substring(8, 10);
        
            const d = new Date(yr, mn, dy);

            const transaction = ({
                transactionDate : d,
                creditAmount : req.body.creditAmount,
                debitAmount : req.body.debitAmount    
            });

            let transctionArr = [transaction];
            let amt = req.body.creditAmount - req.body.debitAmount     //Total remained (-represnt Shop owes to customer)
            const customerKhata = ({
                customerAadhar : req.body.customerAadhar,
                customerName : req.body.customerName,
                customerFatherName : req.body.customerFathersName,
                customerContact : req.body.customerContact,
                totalAmount : amt,
                transactions : transctionArr
            }); 
            const updated =  await User.findOneAndUpdate({username : userEmail}, {$push : {khataBook : customerKhata}});
            res.redirect('khataEntry')
        }catch(error){
            return res.status(400).json({message : error.message});
        }
    }else{
        res.status(400).redirect('login');
    }
});

app.post("/khataUpdate", async function(req, res){
   
    const token = req.cookies.access_token;
    if(!token){
        return res.status(400).redirect('login');
    }
    const verified = await verifyJwt(token);
    if(verified){
           const userEmail = verified.email;

           const customerAadhar = req.body.customerAadhar;
           let amt = req.body.creditAmount - req.body.debitAmount                   //Parse from the post body            

            try{
                const foundCustomer = await User.findOne({usernaame : userEmail, "khataBook.customerAadhar" : customerAadhar});
               
                if(foundCustomer){
                    try{
                        const newTrans = ({
                            transactionDate : new Date(),
                            creditAmount : req.body.creditAmount,
                            debitAmount : req.body.debitAmount
                        });
                        const updatedData = await User.updateOne({username : userEmail, "khataBook.customerAadhar" : customerAadhar}, 
                        {$push : {"khataBook.$.transactions" : newTrans}, $inc : {"khataBook.$.totalAmount" : amt}})
                        res.redirect('khataEntry');
                    }catch(error){
                        res.status(400).json({message : error.message});
                    }        
                }else{
                    res.status(404).json({Message : "Customer with this aadhar number does not exist in your khatabook"})
                }   

            }catch(error){
               return res.status(400).json({message : error.message});
            }
    }else{
        return res.status(400).redirect('login');
    }
});

app.post("/khataDetails", function(req, res){
    console.log(req.body);
    res.redirect("khataDetails")
})

app.listen(port, function(){
    console.log("Server is listening at" + port);
});
