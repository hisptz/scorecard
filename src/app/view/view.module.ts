import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';
import {SharedModule} from '../shared/shared.module';
import {Ng2HighchartsModule} from 'ng2-highcharts';
import {view_routing} from './view.routing';
import {ScorecardComponent} from './scorecard/scorecard.component';
import {IndicatorCardComponent} from './indicator-card/indicator-card.component';
import {SubtotalComponent} from './subtotal/subtotal.component';
import {SvgItemComponent} from './svg-item/svg-item.component';
import {MetadataDictionaryComponent} from './metadata-dictionary/metadata-dictionary.component';

@NgModule({
  imports: [
    SharedModule,
    Ng2HighchartsModule,
    view_routing
  ],
  declarations: [
    ViewComponent,
    ScorecardComponent,
    IndicatorCardComponent,
    MetadataDictionaryComponent,
    SubtotalComponent,
    SvgItemComponent
  ]
})
export class ViewModule { }
