const e = require('express');
const {isDateSameFunction} = require('./CompareDates');

async function getTodaysReport(data){
    let dataLength = data.length;

    let totalTodaysBill = 0;
    let totalTodaysAmount = 0;
    let totalProductsSold = 0;
    let totalYesterdaysAmount = 0;
    for(let i=0; i<dataLength; i++){

        let invoiceDate = data[i].invoiceDate;
        let todaysDate = new Date();

        let yesterdaysDate = new Date(todaysDate);
        yesterdaysDate.setDate(yesterdaysDate.getDate()-1);

        let isDateSame = await isDateSameFunction(invoiceDate, todaysDate);
        if(isDateSame){
            totalTodaysBill = totalTodaysBill+1;
            totalTodaysAmount = totalTodaysAmount + (data[i].totalAmount);
            totalProductsSold = totalProductsSold+2;
        }

        let isYesterdaysInvoice = await isDateSameFunction(invoiceDate, yesterdaysDate);

        if(isYesterdaysInvoice){
            totalYesterdaysAmount += data[i].totalAmount;
        }
        
    }

    let percentOfGrowth = ((totalTodaysAmount/100)*100) - 100;
    return {
        "totalBill" : totalTodaysBill,
        "totalAmount" : totalTodaysAmount,
        "totalProducts" : totalProductsSold,
        "yesterdaysSale" : totalYesterdaysAmount,
        "growth" : percentOfGrowth
    } 
}

async function getWeeklyReport(data, daysCount){
    const dataLen = data.length;
    let map = new Map();
    for(let i=0; i<daysCount; ++i){
        map.set(i, 0);
    }


    for(let i=0; i<dataLen; i++)
    {
        let invoiceDate = data[i].invoiceDate;
        let todaysDate = new Date();

        for(let j=0; j<daysCount; j++){
            let prevDayDate = new Date(todaysDate);
            prevDayDate.setDate(prevDayDate.getDate() - j);
        
            let isSameDate = await isDateSameFunction(invoiceDate, prevDayDate);

            if(isSameDate && data[i].totalAmount){
                let prevValue = map.get(j);
                map.set(j, prevValue + data[i].totalAmount);
            }
        }
    }
   return map;
}

async function getProductWiseSales(data){
   let dataLen = data.length;
   let map = new Map();               //Map of String to integer type

   let productTypeArray = ['seeds', 'rodenticides', 'biopesticides', 'insecticides', 'weedicides', 'syntheticfertilizer', 'growthregulators', 
                         'fungicides', 'biofertilizers', 'herbicides'];

    for(let i=0; i<10; ++i){
        map.set(productTypeArray[i], 0);
    }

   for(let i=0; i<dataLen; ++i){
       const productList = data[i].allProducts;
       const productListLen = productList.length;

       for(let j=0; j<productListLen; ++j){
            if(productList[j]){
                let productType = productList[j].typeOfProduct;
                const finalProductType = productType.toLowerCase();
                const productSaleAmount = productList[j].subTotal;


                if(map.has(finalProductType)){
                    const prevValue = map.get(finalProductType);
                    map.set(finalProductType, prevValue+productSaleAmount);
                }else{
                    map.set(finalProductType, productSaleAmount);
                }
            }       
       }
   }
   return map;
}


async function getAllProductDayWise(data){        //Getting data of last 7 days 
    let dataArr = new Array(7);
    for(let i=0; i<7; i++){
        dataArr[i] = new Array();
    }
    let dataLen = data.length;
    
    for(let i=0; i<7; ++i){                     //Run for each date of last 7 days
        let todaysDate = new Date();
        let prevDayDate = new Date(todaysDate)
        prevDayDate.setDate(prevDayDate.getDate() - i);
    
        for(let j=0; j<dataLen; ++j){
            const invoiceDate = data[j].invoiceDate;

            let isDateSame = await isDateSameFunction(invoiceDate, prevDayDate);
            if(isDateSame){
               
                dataArr[i].push(data[j].allProducts);
            }
        }
    }
    return dataArr;

}

async function getDataWrtTypeOfProduct(data){
    const dataLen = data.length;
    let map = new Map();       //Map of String to integer  --> Type of product to total sales of product
    let productTypeArray = ['seeds', 'rodenticides', 'biopesticides', 'insecticides', 'weedicides', 'syntheticfertilizer', 'growthregulators', 
                         'fungicides', 'biofertilizers', 'herbicides'];

    for(let i=0; i<10; ++i){
        map.set(productTypeArray[i], 0);
    }

   

    for(let i=0; i<dataLen; ++i){
        let productsArr = data[i];

        const productsArrLen = productsArr.length;
        for(let j=0; j<productsArrLen; ++j){
            let productType = productsArr[j].typeOfProduct;
            const productSaleAmount = productsArr[j].subTotal;

            const productTypeFinal = productType.toLowerCase();

            if(map.has(productTypeFinal)){
                let prevValue = map.get(productTypeFinal);
                map.set(productTypeFinal, prevValue+productSaleAmount);
            }else{
                map.set(productTypeFinal, productSaleAmount)
            }

        }
    }
    return map;

}

async function getCompanyWiseReport(data, productType){
   //return map sales amount wrt to company of the product
   const dataLen = data.length;
   let companyWiseMap = new Map();
   for(let i=0; i<dataLen; ++i){
       const productArray = data[i].allProducts;
       const productsArrLen = productArray.length;

       for(let j=0; j<productsArrLen; ++j){
         if(productArray[j]){
            let currProductType  =  productArray[j].typeOfProduct;
            const finalProductType = currProductType.toLowerCase();

            if(finalProductType === productType){
                let companyName = productArray[j].companyName;
                const finalCompanyName = companyName.toLowerCase();
                let productSaleAmount = 0;
                 productSaleAmount = productArray[j].subTotal;
                if(companyWiseMap.has(finalCompanyName) === true){
                    let prevValue = companyWiseMap.get(finalCompanyName);
                    companyWiseMap.set(finalCompanyName, prevValue + productSaleAmount)
                }else{
                    companyWiseMap.set(finalCompanyName, productSaleAmount);
                }
            }
         }
           
       }
   }
   return companyWiseMap;
}
module.exports = {getTodaysReport, getWeeklyReport, getProductWiseSales, getAllProductDayWise, getDataWrtTypeOfProduct, getCompanyWiseReport};