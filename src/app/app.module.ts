import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomeComponent } from './home/home.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {ScoreCardRoutingModule} from './app-routing.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {TourNgBootstrapModule} from 'ngx-tour-ng-bootstrap';
import {MenuModule} from './shared/components/menu/menu.module';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MenuModule,
    FormsModule,
    ReactiveFormsModule,
    ScoreCardRoutingModule,
    NgxPaginationModule,
    TourNgBootstrapModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
