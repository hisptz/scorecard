import { Injectable } from '@angular/core';

@Injectable()
export class SpecificPeriodService {

  constructor() { }
  getPeriodArray(type,year){
    let periods = [];
    if(type == "Weekly"){
      periods.push({id:'',name:''})
    }else if(type == "Monthly"){
      periods.push({id:year+'12',name:'December '+year},{id:year+'11',name:'November '+year},{id:year+'10',name:'October '+year},{id:year+'09',name:'September '+year},{id:year+'08',name:'August '+year},{id:year+'07',name:'July '+year},{id:year+'06',name:'June '+year},{id:year+'05',name:'May '+year},{id:year+'04',name:'April '+year},{id:year+'03',name:'March '+year},{id:year+'02',name:'February '+year},{id:year+'01',name:'January '+year,selected:true})
    }else if(type == "BiMonthly"){
      periods.push({id:year+'01B',name:'January - February '+year,selected:true},{id:year+'02B',name:'March - April '+year},{id:year+'03B',name:'May - June '+year},{id:year+'04B',name:'July - August '+year},{id:year+'05B',name:'September - October '+year},{id:year+'06B',name:'November - December '+year})
    }else if(type == "Quarterly"){
      periods.push({id:year+'Q4',name:'October - December '+year},{id:year+'Q3',name:'July - September '+year},{id:year+'Q2',name:'April - June '+year},{id:year+'Q1',name:'January - March '+year,selected:true})
    }else if(type == "SixMonthly"){
      periods.push({id:year+'S1',name:'January - June '+year,selected:true},{id:year+'S2',name:'July - December '+year})
    }else if(type == "SixMonthlyApril"){
      let useYear = parseInt(year) + 1;
      periods.push({id:year+'AprilS2',name:'October '+year+' - March '+useYear,selected:true},{id:year+'AprilS1',name:'April - September '+year})
    }else if(type == "FinancialOct"){
      for (let i = 0; i <= 10; i++) {
        let useYear = parseInt(year) - i;
        let currentYear = useYear + 1;
        periods.push({id:useYear+'Oct',name:'October '+useYear+' - September '+ currentYear})
      }
    }else if(type == "Yearly"){
      for (let i = 0; i <= 10; i++) {
        let useYear = parseInt(year) - i;
        periods.push({id:useYear,name:useYear})

      }
    }else if(type == "FinancialJuly"){
      for (let i = 0; i <= 10; i++) {
        let useYear = parseInt(year) - i;
        let currentYear = useYear + 1;
        periods.push({id:useYear+'July',name:'July '+useYear+' - June '+ currentYear})
      }
    }else if(type == "FinancialApril"){
      for (let i = 0; i <= 10; i++) {
        let useYear = parseInt(year) - i;
        let currentYear = useYear + 1;
        periods.push({ id:useYear+'April',name:'April '+useYear+' - March '+ currentYear })
      }
    }else if(type == "Relative Weeks"){
      periods.push({id:'THIS_WEEK',name:'This Week'},{id:'LAST_WEEK',name:'Last Week'},{id:'LAST_4_WEEK',name:'Last 4 Weeks',selected:true},{id:'LAST_12_WEEK',name:'last 12 Weeks'},{id:'LAST_52_WEEK',name:'Last 52 weeks'});
    }else if(type == "RelativeMonth"){
      periods.push({id:'THIS_MONTH',name:'This Month'},{id:'LAST_MONTH',name:'Last Month'},{id:'LAST_3_MONTHS',name:'Last 3 Months'},{id:'LAST_6_MONTHS',name:'Last 6 Months'},{id:'LAST_12_MONTHS',name:'Last 12 Months',selected:true});
    }else if(type == "Relative Bi-Month"){
      periods.push({id:'THIS_BIMONTH',name:'This Bi-month'},{id:'LAST_BIMONTH',name:'Last Bi-month'},{id:'LAST_6_BIMONTHS',name:'Last 6 bi-month',selected:true});
    }else if(type == "RelativeQuarter"){
      periods.push({id:'THIS_QUARTER',name:'This Quarter'},{id:'LAST_QUARTER',name:'Last Quarter'},{id:'LAST_4_QUARTERS',name:'Last 4 Quarters',selected:true});
    }else if(type == "RelativeSixMonthly"){
      periods.push({id:'THIS_SIX_MONTH',name:'This Six-month'},{id:'LAST_SIX_MONTH',name:'Last Six-month'},{id:'LAST_2_SIXMONTHS',name:'Last 2 Six-month',selected:true});
    }else if(type == "RelativeFinancialYear"){
      periods.push({id:'THIS_FINANCIAL_YEAR',name:'This Financial Year'},{id:'LAST_FINANCIAL_YEAR',name:'Last Financial Year',selected:true},{id:'LAST_5_FINANCIAL_YEARS',name:'Last 5 Financial Years'});
    }else if(type == "RelativeYear"){
      periods.push({id:'THIS_YEAR',name:'This Year'},{id:'LAST_YEAR',name:'Last Year',selected:true},{id:'LAST_5_YEARS',name:'Last 5 Five Years'});
    }
    return periods;
  }

  getFinencialPeriodArray(type,year){
    let periods = [];
    let last_yaer = parseInt(year) - 1;
    if(type == "Monthly"){
      periods.push(
        {id:last_yaer+'07',name:'July '+last_yaer},
        {id:last_yaer+'08',name:'August '+last_yaer},
        {id:last_yaer+'09',name:'September '+last_yaer},
        {id:last_yaer+'10',name:'October '+last_yaer},
        {id:last_yaer+'11',name:'November '+last_yaer},
        {id:last_yaer+'12',name:'December '+last_yaer},
        {id:year+'01',name:'January '+year,selected:true},
        {id:year+'02',name:'February '+year},
        {id:year+'03',name:'March '+year},
        {id:year+'04',name:'April '+year},
        {id:year+'05',name:'May '+year},
        {id:year+'06',name:'June '+year}
      )
    }else if(type == "Quarterly"){
      periods.push(
        {id:last_yaer+'Q3',name:'July - September '+last_yaer},
        {id:last_yaer+'Q4',name:'October - December '+last_yaer},
        {id:year+'Q1',name:'January - March '+year,selected:true},
        {id:year+'Q2',name:'April - June '+year}
      )
    }else if(type == "FinancialJuly"){
      for (let i = 0; i <= 10; i++) {
        let useYear = parseInt(year) - i;
        let currentYear = useYear + 1;
        periods.push({id:useYear+'July',name:'July '+useYear+' - June '+ currentYear})
      }
    }else if(type == "RelativeMonth"){
      periods.push({id:'THIS_MONTH',name:'This Month'},{id:'LAST_MONTH',name:'Last Month'},{id:'LAST_3_MONTHS',name:'Last 3 Months'},{id:'LAST_6_MONTHS',name:'Last 6 Months'},{id:'LAST_12_MONTHS',name:'Last 12 Months',selected:true});
    }else if(type == "RelativeQuarter"){
      periods.push({id:'THIS_QUARTER',name:'This Quarter'},{id:'LAST_QUARTER',name:'Last Quarter'},{id:'LAST_4_QUARTERS',name:'Last 4 Quarters',selected:true});
    }else if(type == "RelativeFinancialYear"){
      periods.push({id:'THIS_FINANCIAL_YEAR',name:'This Financial Year'},{id:'LAST_FINANCIAL_YEAR',name:'Last Financial Year',selected:true},{id:'LAST_5_FINANCIAL_YEARS',name:'Last 5 Financial Years'});
    }else if(type == "RelativeYear"){
      periods.push({id:'THIS_YEAR',name:'This Year'},{id:'LAST_YEAR',name:'Last Year',selected:true},{id:'LAST_5_YEARS',name:'Last 5 Five Years'});
    }
    return periods;
  }
  getLastPeriod(period: any, period_type:string ="Quarterly" ):any{
    if(period_type == "Weekly"){

    }
    else if(period_type == "Monthly"){
      let year = period.substring(0,4);
      let month = period.substring(4,6);
      let time = "";
      if(month == "02"){
        time = year+"01";
      }else if(month == "03"){
        time = year+"02";
      }else if(month == "04"){
        time = year+"03";
      }else if(month == "05"){
        time = year+"04";
      }else if(month == "06"){
        time = year+"05";
      }else if(month == "07"){
        time = year+"06";
      }else if(month == "08"){
        time = year+"07";
      }else if(month == "09"){
        time = year+"08";
      }else if(month == "10"){
        time = year+"09";
      }else if(month == "11"){
        time = year+"10";
      }else if(month == "12"){
        time = year+"11";
      }else if(month == "01"){
        let yr = parseInt(year)-1;
        time = yr+"12";
      }
      return time;
    }
    else if(period_type == "BiMonthly"){
      let year = period.substring(0,4);
      let month = period.substring(4,6);
      let time = "";
      if(month == "02"){
        time = year+"01B";
      }else if(month == "03"){
        time = year+"02B";
      }else if(month == "04"){
        time = year+"03B";
      }else if(month == "05"){
        time = year+"04B";
      }else if(month == "06"){
        time = year+"05B";
      }else if(month == "01"){
        let yr = parseInt(year)-1;
        time = yr+"06B";
      }
      return time;
    }
    else if(period_type == "Quarterly"){
      let year = period.substring(0,4);
      let quater = period.substring(4,6);
      let time = "";
      if(quater == "Q4"){
        time = year+"Q3";
      }else if(quater == "Q3"){
        time = year+"Q2";
      }else if(quater == "Q2"){
        time = year+"Q1";
      }else if(quater == "Q1"){
        let yr = parseInt(year)-1;
        time = yr+"Q4";
      }
      return time;
    }
    else if(period_type == "SixMonthly"){
      let year = period.substring(0,4);
      let six_month = period.substring(4,6);
      let time = "";
      if(six_month == "S1"){
        let yr = parseInt(year)-1;
        time = yr+"S2";
      }else if(six_month == "S2"){
        time = year+"S1"
      }
      return time;
    }
    else if(period_type == "SixMonthlyApril"){
      let year = period.substring(0,4);
      let six_month = period.substring(4,12);
      let time = "";
      if(six_month == "AprilS2"){
        time = year+"AprilS1"
      }else if(six_month == "AprilS1"){
        let yr = parseInt(year)-1;
        time = yr+"AprilS2";
      }
      return time;
    }
    else if(period_type == "FinancialOct"){
      let year = period.substring(0,4);
      let last_year = parseInt(year) - 1;
      return last_year+"Oct"
    }
    else if(period_type == "Yearly"){
      return parseInt(period)-1;
    }
    else if(period_type == "FinancialJuly"){
      let year = period.substring(0,4);
      let last_year = parseInt(year) - 1;
      return last_year+"July"
    }
    else if(period_type == "FinancialApril"){
      let year = period.substring(0,4);
      let last_year = parseInt(year) - 1;
      return last_year+"April"
    }


  }

  getNextPeriod(period: any, period_type:string ="Quarterly"):any{
    if(period_type == "Weekly"){

    }
    else if(period_type == "Monthly"){
      let year = period.substring(0,4);
      let month = period.substring(4,6);
      let time = "";
      if(month == "02"){
        time = year+"03";
      }else if(month == "03"){
        time = year+"04";
      }else if(month == "04"){
        time = year+"05";
      }else if(month == "05"){
        time = year+"06";
      }else if(month == "06"){
        time = year+"07";
      }else if(month == "07"){
        time = year+"08";
      }else if(month == "08"){
        time = year+"09";
      }else if(month == "09"){
        time = year+"10";
      }else if(month == "10"){
        time = year+"11";
      }else if(month == "11"){
        time = year+"12";
      }else if(month == "12"){
        let yr = parseInt(year)+1;
        time = yr+"01";
      }else if(month == "01"){
        time = year+"02";
      }
      return time;
    }
    else if(period_type == "BiMonthly"){
      let year = period.substring(0,4);
      let month = period.substring(4,6);
      let time = "";
      if(month == "02"){
        time = year+"03B";
      }else if(month == "03"){
        time = year+"04B";
      }else if(month == "04"){
        time = year+"05B";
      }else if(month == "05"){
        time = year+"06B";
      }else if(month == "06"){
        let yr = parseInt(year)+1;
        time = yr+"01B";
      }else if(month == "01"){
        time = year+"02B";
      }
      return time;
    }
    else if(period_type == "Quarterly"){
      let year = period.substring(0,4);
      let quater = period.substring(4,6);
      let time = "";
      if(quater == "Q1"){
        time = year+"Q2";
      }else if(quater == "Q3"){
        time = year+"Q4";
      }else if(quater == "Q2"){
        time = year+"Q3";
      }else if(quater == "Q4"){
        let yr = parseInt(year)+1;
        time = yr+"Q1";
      }
      return time;
    }
    else if(period_type == "SixMonthly"){
      let year = period.substring(0,4);
      let six_month = period.substring(4,6);
      let time = "";
      if(six_month == "S2"){
        let yr = parseInt(year)+1;
        time = yr+"S1";
      }else if(six_month == "S1"){
        time = year+"S2"
      }
      return time;
    }
    else if(period_type == "SixMonthlyApril"){
      let year = period.substring(0,4);
      let six_month = period.substring(4,12);
      let time = "";
      if(six_month == "AprilS2"){
        let yr = parseInt(year)+1;
        time = yr+"AprilS1";
      }else if(six_month == "AprilS1"){
        time = year+"AprilS2"
      }
      return time;
    }
    else if(period_type == "FinancialOct"){
      let year = period.substring(0,4);
      let last_year = parseInt(year) + 1;
      return last_year+"Oct"
    }
    else if(period_type == "Yearly"){
      return parseInt(period)+1;
    }
    else if(period_type == "FinancialJuly"){
      let year = period.substring(0,4);
      let last_year = parseInt(year) + 1;
      return last_year+"July"
    }
    else if(period_type == "FinancialApril"){
      let year = period.substring(0,4);
      let last_year = parseInt(year) + 1;
      return last_year+"April"
    }
  }

  getPeriodName(id:string){
    for ( let period of this.getPeriodArray(this.deducePeriodType(id).type, id.substr(0,4))){
      if( id == period.id){
        return period.name;
      }
    }
  }

  deducePeriodType(period: any):any{
    let period_length = period.length;
    let period_type = "";
    let period_object = {
      "type":"",
      "year":period.substr(0,4)
    };
    if( period_length == 4){
      period_type = "Yearly";
    }else if( period_length == 6 ){

      if(period.substr(4,1) == "Q"){
        period_type = "Quarterly";
      }else if(period.substr(4,1) == "S"){
        period_type = "SixMonthly";
      }else{
        period_type = "Monthly"
      }

    }else if( period_length == 7 ){

      if(period.substr(6,1) == "B"){
        period_type = "BiMonthly";
      }else if(period.substr(4,3) == "Oct"){
        period_type = "FinancialOct";
      }

    }else if( period_length == 8 ){
      if(period.substr(4,4) == "July"){
        period_type = "FinancialJuly";
      }
    }else if( period_length == 9 ){
      if(period.substr(4,5) == "April"){
        period_type = "FinancialApril";
      }
    }else if( period_length == 11 ){
      if(period.substr(4,6) == "AprilS"){
        period_type = "SixMonthlyApril";
      }
    }
    period_object.type = period_type;
    return period_object;
  }

}
