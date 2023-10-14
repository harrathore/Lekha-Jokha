async function isDateSameFunction(d1, d2){
    const d1Day = d1.getDate();
    const d1Month = d1.getMonth();
    const d1Year = d1.getFullYear();

    const d2Day = d2.getDate();
    const d2Month = d2.getMonth();
    const d2Year = d2.getFullYear();

    return (d1Day === d2Day && d1Month === d2Month && d1Year === d2Year);
}

// async function isDateOfYesterday(date){
//     const dateDay = date.getDate();
//     const dateMonth = date.getMonth();
//     const dateYear = date.getFullYear();

//     if(todaysYear !== dateYear){
//         return false;
//     }else if(todaysMonth !== dateMonth){

//     }
// }

module.exports = {isDateSameFunction};