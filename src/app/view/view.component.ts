import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { ApplicationState } from '../store/reducers';
import { ScorecardService } from '../shared/services/scorecard.service';
import * as viewActions from '../store/actions/view.actions';
import * as viewSelectors from '../store/selectors/view.selectors';
import { ScoreCard } from '../shared/models/scorecard';
import { IndicatorHolder } from '../shared/models/indicator-holder';
import { IndicatorHolderGroup } from '../shared/models/indicator-holders-group';
import { Legend } from '../shared/models/legend';
import { Go } from '../store/actions/router.action';
import { LoadOrganisationUnitItem } from '../store/actions/orgunits.actions';
import {
  getFunctions,
  getFunctionsLoaded
} from '../store/selectors/static-data.selectors';
import * as orgunitSelector from '../store/selectors/orgunits.selectors';
import { ScorecardComponent } from './scorecard/scorecard.component';
import tourSteps from '../shared/tourGuide/tour.view';
import { TourService } from 'ngx-tour-ng-bootstrap';
import { SetSortingColumn } from '../store/actions/view.actions';
import {
  fadeIn,
  fadeOut,
  fadeSmooth,
  zoomCard
} from '../shared/animations/basic-animations';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  animations: [
    fadeIn,
    fadeOut,
    fadeSmooth,
    trigger('visibilityChanged', [
      state(
        'notHovered',
        style({
          opacity: 0,
          transform: 'scale(0, 0)',
          position: 'fixed',
          top: '-100px',
          'box-shadow': '0 0 0px rgba(0,0,0,0.0)',
          'background-color': 'rgba(0,0,0,0.0)',
          border: '0px solid #ddd'
        })
      ),
      state(
        'hoovered',
        style({
          'min-height': '580px',
          width: '90%',
          left: '5%',
          position: 'fixed',
          opacity: 1,
          top: '100px',
          'z-index': '100',
          '-webkit-box-shadow': '0 0 10px rgba(0,0,0,0.2)',
          'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
          'background-color': 'rgba(255,255,255,1)',
          border: '1px solid #ddd'
        })
      ),
      transition('notHovered <=> hoovered', animate('500ms 10ms ease-out'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(600, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ]),
    trigger('newhiddenState', [
      transition(':enter', [
        style({
          transform: 'scale(0) translateY(-100px)',
          opacity: '0'
        }),
        animate(
          '400ms 100ms ease-in',
          style({
            transform: 'scale(1) translateY(0px)',
            opacity: '1'
          })
        )
      ]),
      transition(':leave', [
        animate(
          '400ms 100ms ease-in',
          style({
            transform: 'scale(0) translateY(0px)',
            opacity: '0'
          })
        )
      ])
    ])
  ]
})
export class ViewComponent implements OnInit, AfterViewInit {
  scorecard$: Observable<ScoreCard>;
  ordered_holder_list$: Observable<IndicatorHolder[]>;
  additional_labels$: Observable<any>;
  indicator_holders$: Observable<IndicatorHolder[]>;
  indicator_holder_groups$: Observable<IndicatorHolderGroup[]>;
  legendset_definitions$: Observable<Legend[]>;
  scorecard_header$: Observable<any>;
  loaded$: Observable<boolean>;
  orgunit_loading$: Observable<boolean>;
  functions_loaded$: Observable<boolean>;
  metadata_ready$: Observable<boolean>;
  sorting_column$: Observable<string>;

  selectedOrganisationUnits$: Observable<any>;
  selectedPeriod$: Observable<any>;
  functions$: Observable<any>;

  organisation_unit_nodes: any;
  hoverState = 'notHovered';
  indicatorDetails = null;
  showPreview = false;
  sorting_column = 'none';

  @ViewChild(ScorecardComponent, { static: false })
  childScoreCard: ScorecardComponent;
  downloadJsonHref: any;
  downloadOUJsonHref: any;
  constructor(
    private store: Store<ApplicationState>,
    private scorecardService: ScorecardService,
    private sanitizer: DomSanitizer,
    public tourService: TourService
  ) {
    this.store.dispatch(new viewActions.GetScorecardToView());
    this.store.dispatch(new LoadOrganisationUnitItem());
    this.scorecard$ = this.store.select(viewSelectors.getScorecardToView);
    this.ordered_holder_list$ = this.store.select(viewSelectors.getHoldersList);

    this.additional_labels$ = this.store.select(
      viewSelectors.getAdditionalLabels
    );
    this.indicator_holders$ = this.store.select(
      viewSelectors.getIndicatorHolders
    );
    this.indicator_holder_groups$ = this.store.select(
      viewSelectors.getHolderGroups
    );
    this.legendset_definitions$ = this.store.select(
      viewSelectors.getLegendSetDefinition
    );
    this.scorecard_header$ = this.store.select(viewSelectors.getHeader);
    this.loaded$ = this.store.select(viewSelectors.getLoaded);
    this.selectedOrganisationUnits$ = this.store.select(
      viewSelectors.getSelectedOu
    );
    this.selectedPeriod$ = this.store.select(viewSelectors.getSelectedPe);
    this.metadata_ready$ = this.store.select(viewSelectors.metaDataReady);
    this.functions$ = this.store.select(getFunctions);
    this.functions_loaded$ = this.store.select(getFunctionsLoaded);
    this.orgunit_loading$ = store.select(orgunitSelector.getOrgunitLoading);
    this.sorting_column$ = store.select(viewSelectors.getSortingColumn);

    this.tourService.initialize(tourSteps);
  }

  startTour() {
    this.tourService.start();
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  goToHomePage() {
    this.store.dispatch(new Go({ path: [''] }));
  }

  loadPreview($event) {
    this.indicatorDetails = $event;

    this.hoverState = 'hoovered';
    this.showPreview = true;
  }

  closeModel() {
    this.hoverState = 'notHovered';
    this.showPreview = false;
  }

  setOrgunitNodes(event) {
    this.organisation_unit_nodes = event.orgtree;
  }

  downloadCsv() {
    this.childScoreCard.downloadCSV();
  }

  generateDownloadJsonUri() {
    this.scorecard$.subscribe(scorecard => {
      const indicators = scorecard.data.data_settings.indicator_holders.map(
        holder => holder.indicators
      );
      const dataValue = [];
      indicators.forEach(indicatorArr => {
        indicatorArr.forEach(indicator => {
          dataValue.push(
            ...Object.keys(indicator.values).map(key => {
              const keyArr = key.split('.');
              return {
                dataElement: indicator.id,
                period: keyArr[1],
                orgUnit: keyArr[0],
                value: _.toString(indicator.values[key])
              };
            })
          );
        });
      });
      const dataElements = [].concat.apply([], indicators).map(indicator => {
        return {
          uid: indicator.id,
          name: indicator.name
        };
      });
      const theJSON = JSON.stringify({
        dataElements: dataElements,
        dataValues: dataValue
      });
      const uri = this.sanitizer.bypassSecurityTrustUrl(
        'data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON)
      );
      this.downloadJsonHref = uri;
    });
  }

  generateDownloadOuUri() {
    const dataValues: any = {
      headers: [
        {
          name: 'dx',
          column: 'Data',
          valueType: 'TEXT',
          type: 'java.lang.String',
          hidden: false,
          meta: true
        },
        {
          name: 'pe',
          column: 'Period',
          valueType: 'TEXT',
          type: 'java.lang.String',
          hidden: false,
          meta: true
        },
        {
          name: 'ou',
          column: 'Organisation unit',
          valueType: 'TEXT',
          type: 'java.lang.String',
          hidden: false,
          meta: true
        },
        {
          name: 'value',
          column: 'Value',
          valueType: 'NUMBER',
          type: 'java.lang.Double',
          hidden: false,
          meta: false
        }
      ]
    };
    dataValues.metaData = {
      items: {},
      dimensions: {}
    };
    dataValues.rows = {};

    this.scorecard$.subscribe(scorecard => {
      const indicators = scorecard.data.data_settings.indicator_holders.map(
        holder => holder.indicators
      );
      const dataValue = [];
      const indicatorIds = [];
      const orgunitIds = [];
      const periodIds = [];
      const indicatorMetadatas = [];
      const organisationUnitMetadatas = [];
      indicators.forEach(indicatorArr => {
        indicatorArr.forEach(indicator => {
          dataValues.metaData.items[indicator.id] = {
            name: indicator.name,
            legendSet: indicator.legendset
          };
          indicatorMetadatas.push({ id: indicator.id, name: indicator.name });
          if (indicatorIds.indexOf(indicator.id) === -1) {
            indicatorIds.push(indicator.id);
          }
          Object.keys(indicator.values).forEach(key => {
            const keyArr = key.split('.');
            if (periodIds.indexOf(keyArr[1]) === -1) {
              periodIds.push(keyArr[1]);
            }
            if (orgunitIds.indexOf(keyArr[0]) === -1) {
              orgunitIds.push(keyArr[0]);
            }
            if (indicator.values[key]) {
              dataValue.push([
                indicator.id,
                keyArr[1],
                keyArr[0],
                _.toString(indicator.values[key])
              ]);
            } else {
              dataValue.push([indicator.id, keyArr[1], keyArr[0], '']);
            }
          });
        });
      });
      dataValues.headers.forEach((headerArray, index, array) => {
        if (index < array.length - 1) {
          dataValues.metaData.items[headerArray.name] = {
            name: headerArray.column
          };
        }
      });
      dataValues.metaData.dimensions['ou'] = orgunitIds;
      dataValues.metaData.dimensions['pe'] = periodIds;
      dataValues.metaData.dimensions['dx'] = indicatorIds;
      dataValues.metaData.dimensions['co'] = [];
      orgunitIds.forEach(ou => {
        const ouI: any = {};
        const detailed_orgunit = this.organisation_unit_nodes.treeModel.getNodeById(
          ou
        );
        if (detailed_orgunit && detailed_orgunit.data.hasOwnProperty('id')) {
          ouI['id'] = detailed_orgunit.data.id;
        }
        if (detailed_orgunit && detailed_orgunit.data.hasOwnProperty('level')) {
          ouI['level'] = detailed_orgunit.data.level;
        }
        if (detailed_orgunit && detailed_orgunit.data.hasOwnProperty('name')) {
          ouI['name'] = detailed_orgunit.data.name;
        }
        if (
          detailed_orgunit &&
          detailed_orgunit.data.hasOwnProperty('parent')
        ) {
          ouI['parent'] = _.omit(detailed_orgunit.data.parent, ['name']);
        }
        organisationUnitMetadatas.push(ouI);
      });

      organisationUnitMetadatas.forEach(orgUnitsArray => {
        dataValues.metaData.items[orgUnitsArray.id] = {
          name: orgUnitsArray.name
        };
      });
      if (dataValue && dataValue.length > 0) {
        dataValues.rows = dataValue;
        dataValues.height = dataValues.rows.length;
        dataValues.width = dataValues.rows[0].length;
        const theJSON = JSON.stringify({ dataValues: [dataValues] });
        const theJSON1 = JSON.stringify({
          organisationUnits: {
            organisationUnits: _.sortBy(organisationUnitMetadatas, ['name'])
          },
          indicators: indicatorMetadatas
        });

        const uri = this.sanitizer.bypassSecurityTrustUrl(
          'data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON)
        );
        const uri1 = this.sanitizer.bypassSecurityTrustUrl(
          'data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON1)
        );
        this.downloadJsonHref = uri;
        this.downloadOUJsonHref = uri1;
      }
    });
  }

  downloadAlma() {}

  loadScorecard(selection: any) {
    if (this.childScoreCard) {
      this.childScoreCard.loadScoreCard(selection);
    }
  }

  onChangeSort(sorting_column) {
    this.store.dispatch(new viewActions.SetSortingColumn(sorting_column));
  }
}
