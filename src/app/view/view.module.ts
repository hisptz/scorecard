import { NgModule } from '@angular/core';
import {Ng2HighchartsModule} from 'ng2-highcharts';
import { ViewComponent } from './view.component';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { SelectorsComponent } from './selectors/selectors.component';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { SubtotalComponent } from './subtotal/subtotal.component';
import { SvgItemComponent } from './svg-item/svg-item.component';
import { IndicatorTitleComponent } from './indicator-title/indicator-title.component';
import { PeriodTitleComponent } from './period-title/period-title.component';
import { DetailsComponent } from './details/details.component';
import { MapContainerComponent } from './details/map-container/map-container.component';
import {MapModule} from '../shared/components/map/map.module';
import {LayoutComponent} from '../shared/components/layout/layout.component';
import {PlaceholderComponent} from '../shared/components/placeholder/placeholder.component';
import {MetadataDictionaryComponent} from '../shared/components/metadata-dictionary/metadata-dictionary.component';
import {TableTemplateComponent} from '../shared/components/table-template/table-template.component';
import { LoadingNotificationComponent } from './scorecard/loading-notification/loading-notification.component';
import {ScorecardHearderComponent} from './scorecard/header/header.component';
import { BasicViewComponent } from './scorecard/basic-view/basic-view.component';
import { InvertedViewComponent } from './scorecard/inverted-view/inverted-view.component';

@NgModule({
  imports: [
    SharedModule,
    MapModule,
    Ng2HighchartsModule,
  ],
  declarations: [
    ViewComponent,
    HeaderComponent,
    SelectorsComponent,
    ScorecardComponent,
    SubtotalComponent,
    SvgItemComponent,
    IndicatorTitleComponent,
    PeriodTitleComponent,
    DetailsComponent,
    MapContainerComponent,
    LayoutComponent,
    PlaceholderComponent,
    MetadataDictionaryComponent,
    TableTemplateComponent,
    LoadingNotificationComponent,
    ScorecardHearderComponent,
    BasicViewComponent,
    InvertedViewComponent
  ]
})
export class ViewModule { }
