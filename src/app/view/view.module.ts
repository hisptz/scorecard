import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';

import {SharedModule} from "../shared/shared.module";
import {view_routing} from "./view.routing";
import { FilterComponent } from './filter/filter.component';
import { IndicatorCardComponent } from './indicator-card/indicator-card.component';
import {Ng2HighchartsModule} from "ng2-highcharts";
import {Ng2DhisVisualizerComponent} from "./ng2-dhis-visualizer/ng2-dhis-visulizer.component";

@NgModule({
  imports: [
    SharedModule,
    view_routing,
    Ng2HighchartsModule
  ],
  declarations: [ViewComponent, FilterComponent, IndicatorCardComponent, Ng2DhisVisualizerComponent]
})
export class ViewModule { }
