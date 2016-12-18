import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';

import {SharedModule} from "../shared/shared.module";
import {view_routing} from "./view.routing";
import { FilterComponent } from './filter/filter.component';

@NgModule({
  imports: [
    SharedModule,
    view_routing
  ],
  declarations: [ViewComponent, FilterComponent]
})
export class ViewModule { }
