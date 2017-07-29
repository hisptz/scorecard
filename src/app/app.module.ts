import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ScoreCardRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NgxPaginationModule } from 'ngx-pagination';
import {StoreModule} from '@ngrx/store';
import {reducers} from './store/reducers/reducers';
import {getInitialState} from './store/application.state';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ScoreCardRoutingModule,
    NgxPaginationModule,
    StoreModule.forRoot(reducers, {
      initialState: getInitialState
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
