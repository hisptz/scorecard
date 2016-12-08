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
import {IndicatorService} from "./shared/services/indicator.service";

@NgModule({
  declarations: [
    AppComponent,
    DhisMenuComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ScoreCardRoutingModule,
    Ng2PaginationModule
  ],
  providers: [
    DataService,
    Constants,
    ScorecardService,
    IndicatorGroupService,
    IndicatorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
