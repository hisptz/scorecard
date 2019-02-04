import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-map-table',
  templateUrl: './map-table.component.html',
  styleUrls: ['./map-table.component.css']
})
export class MapTableComponent implements OnInit {
  @Input() tableContents: any;
  activeLayer: any;
  activeLink: any = {};

  constructor() {

  }

  ngOnInit() {
    if (this.tableContents) {
      this.activeLayer = this.tableContents.headers[0];
      this.activeLink[this.activeLayer] = 'active';
    }
  }


  activetLayer(layerName) {
    this.activeLink = {};
    this.activeLayer = layerName;
    this.activeLink[this.activeLayer] = 'active';
  }

  readableName(header) {
    return header.split('$')[0]
  }

  getBackgroundColor(columnIndex, columnValue): string {
    let color: string = "";
    if (columnIndex == 3) {
      color = columnValue;
    } else {
      color = "";
    }
    return color;
  }

}
