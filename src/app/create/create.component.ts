import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Store} from '@ngrx/store';
import { ApplicationState } from '../store/reducers';
import * as createActions from '../store/actions/create.actions';
import * as createSelectors from '../store/selectors/create.selectors';
import * as dataActions from '../store/actions/static-data.actions';
import { Observable } from 'rxjs/Observable';
import { ScoreCard } from '../shared/models/scorecard';
import { Back, Go } from '../store/actions/router.action';
import { IndicatorHolder } from '../shared/models/indicator-holder';
import { IndicatorHolderGroup } from '../shared/models/indicator-holders-group';
import { LoadOrganisationUnitItem } from '../store/actions/orgunits.actions';
import {Legend} from '../shared/models/legend';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('notHovered' , style({
        'transform': 'scale(1, 1)',
        '-webkit-box-shadow': '0 0 0px rgba(0,0,0,0.1)',
        'box-shadow': '0 0 0px rgba(0,0,0,0.2)',
        'background-color': 'rgba(0,0,0,0.0)',
        'border': '0px solid #ddd'
      })),
      state('hoovered', style({
        'transform': 'scale(1.04, 1.04)',
        '-webkit-box-shadow': '0 0 10px rgba(0,0,0,0.2)',
        'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
        'background-color': 'rgba(0,0,0,0.03)',
        'border': '1px solid #ddd'
      })),
      transition('notHovered <=> hoovered', animate('400ms'))
    ])
  ]
})
export class CreateComponent implements OnInit {

  scorecard$: Observable<ScoreCard>;
  current_indicator_holder$: Observable<IndicatorHolder>;
  current_holder_group$: Observable<IndicatorHolderGroup>;
  next_indicator_holder_id$: Observable<number>;
  next_holder_group_id$: Observable<number>;
  ordered_holder_list$: Observable<IndicatorHolder[]>;

  show_title_warning$: Observable<boolean>;

  additional_labels$: Observable<any>;
  indicator_holders$: Observable<IndicatorHolder[]>;
  indicator_holder_groups$: Observable<IndicatorHolderGroup[]>;
  legendset_definitions$: Observable<Legend[]>;
  scorecard_header$: Observable<any>;
  scorecard_name$: Observable<string>;
  options$: Observable<any>;
  can_edit$: Observable<any>;
  errorSavingData: boolean = false;

  group_type: string = '';
  active_group: string = '';
  indicator_holders: IndicatorHolder[] = [];

  show_bottleneck_indicators: boolean = false;
  bottleneck_card_indicator: any = {};

  constructor(private store: Store<ApplicationState>) {
    // load needed data
    this.store.dispatch(new createActions.GetScorecardToCreate());
    this.store.dispatch(new dataActions.LoadFunction());
    this.store.dispatch(new dataActions.LoadUserGroups());
    this.store.dispatch(new LoadOrganisationUnitItem());

    this.scorecard$ = this.store.select(createSelectors.getScorecardToCreate);
    this.store.select(createSelectors.getIndicatorHolders).subscribe(
      (holders) => this.indicator_holders = holders);
    this.current_indicator_holder$ = this.store.select(createSelectors.getCurrentIndicatorHolder);
    this.current_holder_group$ = this.store.select(createSelectors.getCurrentGroup);
    this.next_indicator_holder_id$ = this.store.select(createSelectors.getNextHolderId);
    this.next_holder_group_id$ = this.store.select(createSelectors.getNextGroupId);
    this.ordered_holder_list$ = this.store.select(createSelectors.getHoldersList);
    this.show_title_warning$ = this.store.select(createSelectors.getTitleWarning);

    this.additional_labels$ = this.store.select(createSelectors.getAdditionalLabels);
    this.indicator_holders$ = this.store.select(createSelectors.getIndicatorHolders);
    this.indicator_holder_groups$ = this.store.select(createSelectors.getHolderGroups);
    this.legendset_definitions$ = this.store.select(createSelectors.getLegendSetDefinition);
    this.scorecard_header$ = this.store.select(createSelectors.getHeader);
    this.scorecard_name$ = this.store.select(createSelectors.getName);
    this.options$ = this.store.select(createSelectors.getOptions);
    this.can_edit$ = this.store.select(createSelectors.getCanEdit);
  }

  ngOnInit() {
  }

  goToHomePage() {
    this.store.dispatch(new Go({path: ['']}));
  }

  cancelSaving() {
    this.store.dispatch(new Back());
  }

  saveScorecard() {
    console.log('Save scorecard');
  }

  onGroupActivate(event) { this.active_group = event; }

  onGroupTypeChange(event ) {this.group_type = event; }

  /**
   * Bottleneck indicator issues
   * @param indicator
   */
  showBotleneckEditor(indicator) {
    console.log(this.indicator_holders)
    this.bottleneck_card_indicator = indicator;
    this.show_bottleneck_indicators = !this.show_bottleneck_indicators;
  }

  saveBotleneck(indicator) {
    const holders = this.indicator_holders.slice();
    for ( const holder of holders ) {
      for (const item of holder.indicators ) {
        if (item.id === indicator.id) {
          item.bottleneck_indicators = indicator.bottleneck_indicators;
        }
      }
    }
    setTimeout(() => {
      console.log(holders)
      this.store.dispatch(new createActions.SetHolders(holders));
    })
    this.show_bottleneck_indicators = !this.show_bottleneck_indicators;
  }
}
