import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragulaModule} from 'ng2-dragula';
import {DndModule} from 'ng2-dnd';
import {MapService} from './providers/map.service';
import {HttpClientService} from './providers/http-client.service';
import {OrgUnitService} from './providers/org-unit.service';
import {MapVisualizationService} from './providers/map-visualization.service';
import {ColorInterpolationService} from './providers/color-interpolation.service';
import {TileLayers} from './constants/tile-layers';
import {LegendSetService} from './providers/legend-set.service';
import {MapFilesConversion} from './providers/map-files-conversion.service';
import {VisualizationLegendComponent} from './components/visualization-legend/visualization-legend.component';
import {MapTemplateComponent} from './components/map-template/map-template.component';
import {MapTableComponent} from './components/map-table/map-table.component';
import {MapLoaderComponent} from './components/map-loader/map-loader.component';
import {MapComponent} from './map.component';

@NgModule({
  imports: [
    CommonModule,
    DndModule.forRoot(),
    DragulaModule
  ],
  declarations: [
    MapComponent,
    VisualizationLegendComponent,
    MapTemplateComponent,
    MapTableComponent,
    MapLoaderComponent
  ],
  exports: [MapComponent],
  providers: [
    HttpClientService,
    OrgUnitService,
    MapVisualizationService,
    ColorInterpolationService,
    TileLayers,
    LegendSetService,
    MapFilesConversion,
    MapService
  ]
})
export class MapModule {
}
