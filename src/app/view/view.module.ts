import { NgModule } from '@angular/core';
import { ViewComponent } from './view.component';

import {SharedModule} from "../shared/shared.module";
import {view_routing} from "./view.routing";

@NgModule({
  imports: [
    SharedModule,
    view_routing
  ],
  declarations: [ViewComponent]
})
export class ViewModule { }
