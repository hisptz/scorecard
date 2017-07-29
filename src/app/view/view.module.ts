import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';
import {SharedModule} from '../shared/shared.module';
import {Ng2HighchartsModule} from 'ng2-highcharts';
import {view_routing} from './view.routing';

@NgModule({
  imports: [
    SharedModule,
    Ng2HighchartsModule,
    view_routing
  ],
  declarations: [ViewComponent]
})
export class ViewModule { }
