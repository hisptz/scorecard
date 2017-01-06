import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'svg-item',
  templateUrl: './svg-item.component.html',
  styleUrls: []
})
export class SvgItemComponent implements OnInit {

  @Input() current_orgunit: any;
  @Input() indicator: any;
  constructor() { }

  ngOnInit() {
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
