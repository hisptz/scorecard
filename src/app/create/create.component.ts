import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Store } from '@ngrx/store';
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
import { Legend } from '../shared/models/legend';
import tourSteps from '../shared/tourGuide/tour.create';
import { TourService } from 'ngx-tour-ng-bootstrap';
import * as _ from 'lodash';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./create.component.css'],
  animations: [
    trigger('fadeInOut', [
      state(
        'notHovered',
        style({
          transform: 'scale(1, 1)',
          '-webkit-box-shadow': '0 0 0px rgba(0,0,0,0.1)',
          'box-shadow': '0 0 0px rgba(0,0,0,0.2)',
          'background-color': 'rgba(0,0,0,0.0)',
          border: '0px solid #ddd'
        })
      ),
      state(
        'hoovered',
        style({
          transform: 'scale(1.04, 1.04)',
          '-webkit-box-shadow': '0 0 10px rgba(0,0,0,0.2)',
          'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
          'background-color': 'rgba(0,0,0,0.03)',
          border: '1px solid #ddd'
        })
      ),
      transition('notHovered <=> hoovered', animate('400ms'))
    ]),
    trigger('hiddenState', [
      state(
        'hidden',
        style({
          transform: 'scale(0) translateY(-100px)',
          opacity: '0'
        })
      ),
      state(
        'notHidden',
        style({
          transform: 'scale(1) translateY(0px)',
          opacity: '1'
        })
      ),
      transition('hidden <=> notHidden', animate('400ms 100ms ease-in'))
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
export class CreateComponent implements OnInit {
  scorecard$: Observable<ScoreCard>;
  current_indicator_holder$: Observable<IndicatorHolder>;
  current_holder_group$: Observable<IndicatorHolderGroup>;
  next_indicator_holder_id$: Observable<number>;
  next_holder_group_id$: Observable<number>;
  ordered_holder_list$: Observable<IndicatorHolder[]>;

  show_title_warning$: Observable<boolean>;

  additional_labels$: Observable<any>;
  highlighted_indicators$: Observable<any>;
  indicator_holders$: Observable<IndicatorHolder[]>;
  indicator_holder_groups$: Observable<IndicatorHolderGroup[]>;
  legendset_definitions$: Observable<Legend[]>;
  scorecard_header$: Observable<any>;
  scorecard_name$: Observable<string>;
  options$: Observable<any>;
  can_edit$: Observable<any>;
  show_editor$: Observable<boolean>;
  show_highlited_editor$: Observable<boolean>;
  action_type$: Observable<string>;
  errorSavingData = false;

  group_type = '';
  active_group = '';
  indicator_holders: IndicatorHolder[] = [];

  show_bottleneck_indicators = false;
  bottleneck_card_indicator: any = {};
  selected_bottleneck_group: any = null;
  header: any;

  constructor(
    private store: Store<ApplicationState>,
    public tourService: TourService
  ) {
    // load needed data
    this.store.dispatch(new createActions.GetScorecardToCreate());
    this.store.dispatch(new dataActions.LoadFunction());
    this.store.dispatch(new dataActions.LoadUserGroups());
    this.store.dispatch(new LoadOrganisationUnitItem());

    this.scorecard$ = this.store.select(createSelectors.getScorecardToCreate);
    this.store
      .select(createSelectors.getIndicatorHolders)
      .subscribe(holders => (this.indicator_holders = holders));
    this.store.select(createSelectors.getHeader).subscribe(header => {
      this.header = {
        title: header.title,
        sub_title: header.sub_title,
        description: header.description,
        show_arrows_definition: header.show_arrows_definition,
        show_legend_definition: header.show_legend_definition,
        template: header.template
      };
    });
    this.current_indicator_holder$ = this.store.select(
      createSelectors.getCurrentIndicatorHolder
    );
    this.current_holder_group$ = this.store.select(
      createSelectors.getCurrentGroup
    );
    this.next_indicator_holder_id$ = this.store.select(
      createSelectors.getNextHolderId
    );
    this.next_holder_group_id$ = this.store.select(
      createSelectors.getNextGroupId
    );
    this.ordered_holder_list$ = this.store.select(
      createSelectors.getHoldersList
    );
    this.show_title_warning$ = this.store.select(
      createSelectors.getTitleWarning
    );

    this.additional_labels$ = this.store.select(
      createSelectors.getAdditionalLabels
    );
    this.highlighted_indicators$ = this.store.select(
      createSelectors.getHighlightedIndicators
    );
    this.indicator_holders$ = this.store.select(
      createSelectors.getIndicatorHolders
    );
    this.indicator_holder_groups$ = this.store.select(
      createSelectors.getHolderGroups
    );
    this.legendset_definitions$ = this.store.select(
      createSelectors.getLegendSetDefinition
    );
    this.scorecard_header$ = this.store.select(createSelectors.getHeader);
    this.scorecard_name$ = this.store.select(createSelectors.getName);
    this.options$ = this.store.select(createSelectors.getOptions);
    this.can_edit$ = this.store.select(createSelectors.getCanEdit);
    this.show_editor$ = this.store.select(createSelectors.getShowTitleEditor);
    this.show_highlited_editor$ = this.store.select(
      createSelectors.getShowHighlitedEditor
    );
    this.action_type$ = this.store.select(createSelectors.getActionType);
    this.tourService.initialize(tourSteps);
  }

  startTour() {
    this.tourService.start();
  }

  ngOnInit() {}

  goToHomePage() {
    this.store.dispatch(new Go({ path: [''] }));
  }

  cancelSaving() {
    this.store.dispatch(new Back());
  }

  saveScorecard() {}

  onGroupActivate(event) {
    this.active_group = event;
  }

  onGroupTypeChange(event) {
    this.group_type = event;
  }

  showBotleneckEditor(indicator) {
    this.bottleneck_card_indicator = { ...indicator };
    if (indicator.hasOwnProperty('bottleneck_indicators_groups')) {
      if (indicator.bottleneck_indicators_groups.length !== 0) {
        this.selected_bottleneck_group = this.bottleneck_card_indicator.bottleneck_indicators_groups[0];
      }
    }
    this.show_bottleneck_indicators = !this.show_bottleneck_indicators;
  }

  cancelSaveBotleneck() {
    this.show_bottleneck_indicators = !this.show_bottleneck_indicators;
  }

  cancelSaveHighlighted() {
    this.store.dispatch(new createActions.SetEdditingHighlited(false));
  }

  saveBotleneck(indicator) {
    const holders = _.map(this.indicator_holders.slice(), _.cloneDeep);
    for (const holder of holders) {
      for (const item of holder.indicators) {
        if (item.id === indicator.id) {
          item.bottleneck_indicators = indicator.bottleneck_indicators;
          item.bottleneck_indicators_groups =
            indicator.bottleneck_indicators_groups;
          item.use_bottleneck_groups = indicator.use_bottleneck_groups;
        }
      }
    }
    setTimeout(() => {
      this.store.dispatch(new createActions.SetHolders(holders));
    });
    this.show_bottleneck_indicators = !this.show_bottleneck_indicators;
  }

  hideTextEditor() {
    this.store.dispatch(new createActions.SetEdditingHeader(false));
  }

  onTitleChange(event) {
    const header = {
      title: this.header.title,
      sub_title: this.header.sub_title,
      description: this.header.description,
      show_arrows_definition: this.header.show_arrows_definition,
      show_legend_definition: this.header.show_legend_definition,
      template: {
        display: true,
        content: event
      }
    };
    this.store.dispatch(new createActions.SetHeader(header));
  }

  onTitleReady(event) {}

  onTitleBlur(event) {}

  showError(event) {
    this.errorSavingData = event;
  }
}
