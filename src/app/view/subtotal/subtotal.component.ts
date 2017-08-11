import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-subtotal',
  templateUrl: './subtotal.component.html',
  //styleUrls: []
})
export class SubtotalComponent implements OnInit {

  @Input() orgunits: any;
  @Input() indicator: any;
  @Input() scorecard: any;
  @Input() calculation: any;
  @Input() indicator_list: any[] = [];
  @Input() period: string;
  constructor() {

  }

  ngOnInit() {

  }

  findValue(type,orgunits, indicator_id,scorecard){
    if(type == "avg"){
      return parseFloat(this.findColumnAverage(orgunits, indicator_id,scorecard))
    }
    if(type == "sum"){
      return this.findColumnSum(orgunits, indicator_id,scorecard)
    }
  }

  /**
   * Finding avarage for the column
   * @param orgunits, indicator_id
   */
  findColumnAverage(orgunits, indicator_id,scorecard){
    let sum = 0;
    let counter = 0;
    for ( let orgunit of orgunits ){
      let use_key = orgunit.id+"."+this.period;
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(use_key in indicator.values && indicator.id == indicator_id && indicator.values[use_key] != null){
            counter++;
            sum = sum + parseFloat(indicator.values[use_key])
          }
        }
      }
    }
    return (sum/ counter).toFixed(2);
  }

  /**
   * Finding avarage for the column
   * @param orgunits, indicator_id
   */
  findColumnSum(orgunits, indicator_id, scorecard){
    let sum = 0;
    for ( let orgunit of orgunits ){
      let use_key = orgunit.id+"."+this.period;
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(use_key in indicator.values && indicator.id == indicator_id && indicator.values[use_key] != null){
            sum = sum + parseFloat(indicator.values[use_key])
          }
        }
      }
    }
    return sum;
  }

  // a function to prepare a list of indicators to pass into a table
  getIndicatorsList(scorecard): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        indicators.push(indicator);
      }
    }
    return indicators;
  }

  // assign a background color to area depending on the legend set details
  assignBgColor(object,value): string{
    var color = "#BBBBBB";
    for( let data of object.legendset ){
      if(data.max == "-"){

        if(parseInt(value) >= parseInt(data.min) ){
          color = data.color;
        }
      }else{
        if(parseInt(value) >= parseInt(data.min) && parseInt(value) <= parseInt(data.max)){
          color = data.color;
        }
      }
    };
    return color;
  }

}
