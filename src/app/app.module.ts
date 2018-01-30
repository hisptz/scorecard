import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { TourNgBootstrapModule } from 'ngx-tour-ng-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ScoreCardRoutingModule } from './app-routing.module';
import { MenuModule } from './shared/components/menu/menu.module';
import { effects } from './store/effects';
import { reducers } from './store/reducers';
import {environment } from '../environments/environment';
import {CustomSerializer } from './store/reducers/router.reducer';
import {services } from './shared/services';
import {PlaceholderComponent} from './home/placeholder/placeholder.component';
import {DescriptionComponent} from './home/description/description.component';
import {guards} from "./guards/index";
import {RoundProgressModule} from "angular-svg-round-progressbar";
import {LoaderComponent} from "./shared/components/loader/loader.component";
import {ScorecardDetailComponent} from "./home/scorecard-detail/scorecard-detail.component";
import {ScoreCardFilterPipe} from "./home/score-card-filter.pipe";

// Add a function, that returns a “TranslateHttpLoader” and export it (needed by AoT)
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http,
    './assets/i18n/',
    '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlaceholderComponent,
    DescriptionComponent,
    LoaderComponent,
    ScorecardDetailComponent,
    ScoreCardFilterPipe
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
    StoreModule.forRoot(reducers),
    StoreRouterConnectingModule,
    EffectsModule.forRoot(effects),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RoundProgressModule,
    !environment.production ? StoreDevtoolsModule.instrument({maxAge: 100}) : []
  ],
  providers: [
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    ...services,
    ...guards
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
