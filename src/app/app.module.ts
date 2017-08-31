import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ScoreCardRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NgxPaginationModule } from 'ngx-pagination';
import {StoreModule} from '@ngrx/store';
import {reducers} from './store/reducers/reducers';
import {getInitialState} from './store/application.state';
import {EffectsModule} from '@ngrx/effects';
import {DataStoreEffect} from './store/effects/dataStore.effect';
import {StoreService} from './shared/services/store-service';
import {ScoreCardFilterPipe} from './home/score-card-filter.pipe';
import {ScorecardService} from './shared/services/scorecard.service';
import {DataService} from './shared/services/data.service';
import {IndicatorGroupService} from './shared/services/indicator-group.service';
import {DataElementGroupService} from './shared/services/data-element-group.service';
import {FilterService} from './shared/services/filter.service';
import {FunctionService} from './shared/services/function.service';
import {ProgramIndicatorsService} from './shared/services/program-indicators.service';
import {DatasetService} from './shared/services/dataset.service';
import {EventDataService} from './shared/services/event-data.service';
import {HttpClientService} from './shared/services/http-client.service';
import {OrgUnitService} from './shared/services/org-unit.service';
import {Constants} from './shared/services/costants';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import { PlaceholderComponent } from './home/placeholder/placeholder.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ScoreCardFilterPipe,
    PlaceholderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    ScoreCardRoutingModule,
    NgxPaginationModule,
    StoreModule.forRoot(reducers, {
      initialState: getInitialState
    }),
    EffectsModule.forRoot([DataStoreEffect]),
    StoreRouterConnectingModule,
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [
    StoreService,
    ScorecardService,
    DataService,
    IndicatorGroupService,
    DataElementGroupService,
    FilterService,
    FunctionService,
    ProgramIndicatorsService,
    DatasetService,
    EventDataService,
    HttpClientService,
    OrgUnitService,
    Constants
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
