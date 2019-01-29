import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-map-loader',
  templateUrl: './map-loader.component.html',
  styleUrls: ['./map-loader.component.css']
})
export class MapLoaderComponent implements OnInit {

  @Input() mapName: string;
  constructor() { }

  ngOnInit() {
  }

}
