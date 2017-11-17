import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';
import { SharedModule } from '../shared/shared.module';
import { Ng2HighchartsModule } from 'ng2-highcharts';
import { view_routing } from './view.routing';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { SubtotalComponent } from './subtotal/subtotal.component';
import { SvgItemComponent } from './svg-item/svg-item.component';
import { IndicatorTitleComponent } from './indicator-title/indicator-title.component';
import { PeriodTitleComponent } from './period-title/period-title.component';
import { DetailsComponent } from './details/details.component';
import { DragulaModule } from 'ng2-dragula';
import {MapModule} from '../shared/components/map/map.module';
import { MapContainerComponent } from './details/map-container/map-container.component';

@NgModule({
  imports: [
    SharedModule,
    Ng2HighchartsModule,
    MapModule,
    DragulaModule,
    view_routing
  ],
  declarations: [
    ViewComponent,
    ScorecardComponent,
    SubtotalComponent,
    SvgItemComponent,
    IndicatorTitleComponent,
    PeriodTitleComponent,
    DetailsComponent,
    MapContainerComponent
  ]
})
export class ViewModule { }
