import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';

import {SharedModule} from "../shared/shared.module";
import {view_routing} from "./view.routing";
import { FilterComponent } from './filter/filter.component';
import { IndicatorCardComponent } from './indicator-card/indicator-card.component';
import {Ng2HighchartsModule} from "ng2-highcharts";
import {ChartModule} from "angular2-highcharts";
import { SvgItemComponent } from './svg-item/svg-item.component';
import { SubtotalComponent } from './subtotal/subtotal.component';
import {MetadataDictionaryComponent} from "./metadatadictionarycomponent/metadata-dictionary.component";
import {MapComponent} from "./dhis-angular2-leaflet-map-component/map.component";

@NgModule({
  imports: [
    SharedModule,
    view_routing,
    Ng2HighchartsModule,
    ChartModule
  ],
  declarations: [ViewComponent, FilterComponent, IndicatorCardComponent, SvgItemComponent, SubtotalComponent, MetadataDictionaryComponent,MapComponent]
})
export class ViewModule { }
