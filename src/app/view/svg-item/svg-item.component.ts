import {Component, OnInit, Input} from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'svg-item',
  templateUrl: './svg-item.component.html'
})
export class SvgItemComponent implements OnInit {

  @Input() current_orgunit: any;
  @Input() indicator: any;
  @Input() scorecard: any;
  @Input() indicator_list: any[] = [];
  @Input() period: string;
  value_key: string;
  constructor() {

  }

  ngOnInit() {
    this.value_key = this.current_orgunit.id + '.' + this.period;
  }

  // assign a background color to area depending on the legend set details
  // TODO: change the default colors depending on the scorecard legend
  assignBgColor(object, value): string {
    let color = '#BBBBBB';
    if (value === null) {
      color = '#F5F5F5';
    }
    _.each(object.legendset, (data: any)  => {
      if (data.max === '-') {

        if (parseInt(value) >= parseInt(data.min) ) {
          color = data.color;
        }
      }else {
        if (parseInt(value) >= parseInt(data.min) && parseInt(value) <= parseInt(data.max)) {
          color = data.color;
        }
      }
    });
    return color;
  }

}
