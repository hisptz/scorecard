import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { TourNgBootstrapModule } from 'ngx-tour-ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ScoreCardRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MenuModule } from './shared/components/menu/menu.module';

import { environment } from '../environments/environment';
import {CreateModule} from "./create/create.module";
import {ViewModule} from "./view/view.module";
// Add a function, that returns a “TranslateHttpLoader” and export it (needed by AoT)
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


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
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CreateModule,
    ViewModule
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
