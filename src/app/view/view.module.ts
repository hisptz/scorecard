import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';

import {SharedModule} from "../shared/shared.module";
import {view_routing} from "./view.routing";
import { FilterComponent } from './filter/filter.component';
import { IndicatorCardComponent } from './indicator-card/indicator-card.component';
import {Ng2HighchartsModule} from "ng2-highcharts";
import {ChartModule} from "angular2-highcharts";

@NgModule({
  imports: [
    SharedModule,
    view_routing,
    Ng2HighchartsModule,
    ChartModule
  ],
  declarations: [ViewComponent, FilterComponent, IndicatorCardComponent]
})
export class ViewModule { }
