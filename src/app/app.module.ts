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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ScoreCardFilterPipe
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
    EffectsModule.forRoot([DataStoreEffect])
  ],
  providers: [
    StoreService,
    ScorecardService,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
