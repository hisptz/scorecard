import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MapTemplateComponent} from './components/map-template/map-template.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @Input() visualizationObject: any;
  @Input() downloadOptions: any;
  mapHasError: boolean;
  errorMessage: string;
  loaded: boolean;
  @ViewChild(MapTemplateComponent)
  mapTemplateComponent: MapTemplateComponent;

  constructor() {
    this.mapHasError = false;
  }

  downLoadFiles(fileFormat) {
    this.mapTemplateComponent.downloadMap(fileFormat);
  }

  ngOnInit() {
    this.mapHasError = this.visualizationObject.details.hasError;
    this.errorMessage = this.visualizationObject.details.errorMessage;
    this.loaded = this.visualizationObject.details.loaded;
  }


}
