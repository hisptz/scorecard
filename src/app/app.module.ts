import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { TourNgBootstrapModule } from 'ngx-tour-ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import {
  RouterStateSerializer,
  StoreRouterConnectingModule
} from '@ngrx/router-store';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ScoreCardRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
/*import { MenuModule } from './shared/components/ng2-dhis-menu-module/menu.module';*/
import { NgxDhis2MenuModule } from '@hisptz/ngx-dhis2-menu';

import { environment } from '../environments/environment';
import { CreateModule } from './create/create.module';
import { ViewModule } from './view/view.module';
import { reducers } from './store/reducers';
import { DataService } from './shared/services/data.service';
import { ScorecardService } from './shared/services/scorecard.service';
import { HttpClientService } from './shared/services/http-client.service';
import { EffectsModule } from '@ngrx/effects';
import { effects } from './store/effects';
import { CustomSerializer } from './store/reducers/router.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { PlaceholderComponent } from './home/placeholder/placeholder.component';
import { DescriptionComponent } from './home/description/description.component';
import { ScorecardDetailComponent } from './home/scorecard-detail/scorecard-detail.component';
import { ScoreCardFilterPipe } from './home/score-card-filter.pipe';

import * as fromGuards from './guards';
import { OrgUnitService } from './shared/services/org-unit.service';
import { FunctionService } from './shared/services/function.service';
import { IndicatorGroupService } from './shared/services/indicator-group.service';
import { DataElementGroupService } from './shared/services/data-element-group.service';
import { ProgramIndicatorsService } from './shared/services/program-indicators.service';
import { DatasetService } from './shared/services/dataset.service';
import { EventDataService } from './shared/services/event-data.service';
import { VisualizerService } from './shared/services/visualizer.service';
import { FilterService } from './shared/services/filter.service';
import { DocumentationComponent } from './documentation/documentation.component';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';

// Add a function, that returns a “TranslateHttpLoader” and export it (needed by AoT)
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlaceholderComponent,
    DescriptionComponent,
    ScorecardDetailComponent,
    ScoreCardFilterPipe,
    DocumentationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    /*MenuModule,*/
    NgxDhis2MenuModule,
    FormsModule,
    ReactiveFormsModule,
    ScoreCardRoutingModule,
    NgxPaginationModule,
    TourNgBootstrapModule.forRoot(),
    NgxDhis2HttpClientModule.forRoot({
      namespace: 'scorecard',
      version: 1,
      models: {}
    }),
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot(effects),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CreateModule,
    ViewModule,
    !environment.production
      ? StoreDevtoolsModule.instrument({ maxAge: 100 })
      : []
  ],
  providers: [
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    DataService,
    ScorecardService,
    HttpClientService,
    OrgUnitService,
    FunctionService,
    IndicatorGroupService,
    DataElementGroupService,
    ProgramIndicatorsService,
    DatasetService,
    EventDataService,
    VisualizerService,
    FilterService,
    ...fromGuards.guards
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
