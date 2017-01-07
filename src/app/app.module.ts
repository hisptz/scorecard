import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ScoreCardRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component';
import { DhisMenuComponent } from './shared/dhis-menu.component'
import { HomeComponent } from './home/home.component';


import { DataService } from "./shared/data.service";
import { Constants } from './shared/costants';
import {Ng2PaginationModule} from "ng2-pagination";
import {ScorecardService} from "./shared/services/scorecard.service";
import {IndicatorGroupService} from "./shared/services/indicator-group.service";
import {DatasetService} from "./shared/services/dataset.service";
import {DataElementGroupService} from "./shared/services/data-element-group.service";
import { ScoreCardFilterPipe } from './home/score-card-filter.pipe';
import {FilterService} from "./shared/services/filter.service";
import {OrgUnitService} from "./shared/services/org-unit.service";
import {VisulizerService} from "./view/ng2-dhis-visualizer/visulizer.service";
import {ProgramIndicatorsService} from "./shared/services/program-indicators.service";

@NgModule({
  declarations: [
    AppComponent,
    DhisMenuComponent,
    HomeComponent,
    ScoreCardFilterPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ScoreCardRoutingModule,
    Ng2PaginationModule,
  ],
  providers: [
    DataService,
    Constants,
    ScorecardService,
    IndicatorGroupService,
    DatasetService,
    DataElementGroupService,
    FilterService,
    OrgUnitService,
    VisulizerService,
    ProgramIndicatorsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
