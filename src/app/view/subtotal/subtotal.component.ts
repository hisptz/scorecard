import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-subtotal',
  templateUrl: './subtotal.component.html',
  styleUrls: []
})
export class SubtotalComponent implements OnInit {

  @Input() orgunits: any;
  @Input() indicator: any;
  @Input() scorecard: any;
  @Input() calculation: any;
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
    for ( let orgunit of orgunits ){
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(orgunit.id in indicator.values && indicator.id == indicator_id && indicator.values[orgunit.id] != null){
            sum = sum + parseFloat(indicator.values[orgunit.id])
          }
        }
      }
    }
    return (sum/ orgunits.length).toFixed(2);
  }

  /**
   * Finding avarage for the column
   * @param orgunits, indicator_id
   */
  findColumnSum(orgunits, indicator_id, scorecard){
    let sum = 0;
    for ( let orgunit of orgunits ){
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(orgunit.id in indicator.values && indicator.id == indicator_id && indicator.values[orgunit.id] != null){
            sum = sum + parseFloat(indicator.values[orgunit.id])
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
}
