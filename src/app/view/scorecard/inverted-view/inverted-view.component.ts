import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ScoreCard} from '../../../shared/models/scorecard';
import {ScorecardService} from '../../../shared/services/scorecard.service';
import * as _ from 'lodash';
import {ContextMenuComponent, ContextMenuService} from 'ngx-contextmenu';
import {listStateTrigger} from '../../../shared/animations/basic-animations';

@Component({
  selector: 'app-inverted-view',
  templateUrl: './inverted-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./inverted-view.component.css'],
  animations: [listStateTrigger]
})
export class InvertedViewComponent implements OnInit {
  @Input() scorecard: ScoreCard;
  @Input() sorting_column: string = 'none';
  @Input() sortAscending: boolean =  true;
  @Input() current_sorting: boolean =  true;
  @Input() orgunits: any =  [];
  @Input() periods_list: any =  [];
  @Input() hidenColums: any =  [];
  @Input() indicator_holders_list: any =  [];
  @Input() indicator_done_loading: any;
  @Input() indicator_loading: any;
  @Input() old_proccessed_percent: any;
  @Input() has_error: any;
  @Input() error_text: any;
  @Input() sorting_period: any;
  @Input() showSubScorecard: any;
  @Input() children_available: any;
  @Input() subscorecard: any;
  @Input() sub_model: any;
  @Input() selectedPeriod: any;
  @Input() functions: any;
  @Input() organisation_unit_nodes = null;

  @Output() onSortScoreCardFromColumn = new EventEmitter();
  @Output() onDragItemSuccessfull = new EventEmitter();
  @Output() onLoadChildrenData = new EventEmitter();
  @Output() onSortBestWorst = new EventEmitter();
  @Output() onLoadPreview = new EventEmitter();
  @Output() onLoadPreviewFromChild = new EventEmitter();
  @Output() onHideClicked = new EventEmitter();

  show_sum_in_row: boolean = false;
  show_sum_in_column: boolean = false;
  searchQuery: string = '';
  has_bottleneck: boolean[] = [];
  @ViewChild('indicatorMenu') public indicatorMenu: ContextMenuComponent;
  @ViewChild('itemMenu') public itemMenu: ContextMenuComponent;
  constructor(
    private scorecardService: ScorecardService,
    private contextMenuService: ContextMenuService) { }

  ngOnInit() {
  }
  // context menu options
  public onContextMenu($event: MouseEvent, item: any): void {
    this.contextMenuService.show.next({
      // Optional - if unspecified, all context menu components will open
      contextMenu: this.indicatorMenu,
      event: $event,
      'item': item,
    });
  }

  // context menu options
  public onItemContextMenu($event: MouseEvent, item: any, ou: any, pe: any): void {
    this.contextMenuService.show.next({
      // Optional - if unspecified, all context menu components will open
      contextMenu: this.itemMenu,
      event: $event,
      'item': {'item': item, 'ou': ou, 'pe': pe},
    });
  }


  sortScoreCardFromColumn(sortingColumn, sortAscending, orguUnits, period: string, lower_level: boolean = true) {
    this.onSortScoreCardFromColumn.emit({sortingColumn, sortAscending, orguUnits, period, lower_level});
  }

  sortBestWorst(type: any, sortingColumn, sortAscending, orguUnits, period: string, lower_level: boolean = true) {
    this.onSortBestWorst.emit({type, sortingColumn, sortAscending, orguUnits, period, lower_level});
  }

  getGroupColspan(indicator_holder_group) {
    return this.scorecardService.getGroupColspan(
      indicator_holder_group,
      this.scorecard.data.data_settings.indicator_holders,
      this.periods_list,
      this.hidenColums);
  }

  getSubscorecardColspan() {
    return this.scorecardService.getSubscorecardColspan(this.scorecard, this.periods_list, this.hidenColums);
  }

  // simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string {
    return this.scorecardService.getIndicatorTitle(holder, this.hidenColums);
  }

  loadPreview(holderGroup, indicator, ou, period, periods = null, bottleneck = false) {
    this.onLoadPreview.emit({holderGroup, indicator, ou, period, periods, bottleneck});
  }

  loadPreviewFromChild(event) {
    console.log(event)
    this.onLoadPreviewFromChild.emit(event);
  }

  dragItemSuccessfull($event, drop_area: string, object: any) {
    this.onDragItemSuccessfull.emit({$event, drop_area, object});
  }

  getIndicatorLabel(indicator, label) {
    this.scorecardService.getIndicatorLabel(indicator, label, this.hidenColums);
  }

  findRowAverage(orgunit_id, periods_list, period) {
    return this.scorecardService.findRowAverage(orgunit_id, periods_list, period, this.scorecard.data.data_settings.indicator_holders, this.hidenColums);
  }

  findRowTotalAverage(orgunits, period) {
    return this.scorecardService.findRowTotalAverage(orgunits, period, this.scorecard.data.data_settings.indicator_holders, this.hidenColums);
  }

  findRowTotalSum(orgunits, period) {
    return this.scorecardService.findRowTotalSum(orgunits, period, this.scorecard.data.data_settings.indicator_holders, this.hidenColums);
  }

  loadChildrenData(selectedorgunit, indicator) {
    this.onLoadChildrenData.emit({selectedorgunit, indicator});
  }

  // prepare a proper tooltip to display to counter multiple indicators in the same td
  prepareTooltip(holder, orgunit, period): string {
    const tooltip = [];
    const use_key = orgunit + '.' + period;
    for (const indicator of holder.indicators) {
      if (indicator.tooltip && indicator.tooltip[use_key]) {
        tooltip.push(indicator.tooltip[use_key]);
      }
    }
    return tooltip.join(', ');
  }

  // get number of visible indicators from a holder
  getVisibleIndicators(holder) {
    return _.filter(holder.indicators, (indicator: any) => !_.includes(this.hidenColums, indicator.id));
  }

  // check if a column is empty
  isRowEmpty(orgunit_id: string): boolean {
    let checker = false;
    let sum = 0;
    let counter = 0;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        for (const current_period of this.periods_list){
          if (this.hidenColums.indexOf(indicator.id) === -1) {
            sum++;
          }
          if (this.hidenColums.indexOf(indicator.id) === -1 && indicator.values[orgunit_id + '.' + current_period.id] === null) {
            counter++;
          }
        }


      }
    }
    if (counter === sum && !this.scorecard.data.empty_rows) {
      checker = true;
    }
    return checker;
  }


  averageHidden(orgunit_id: string, period: string): boolean {
    let checker = false;
    const avg = this.scorecardService.findRowTotalAverage(this.orgunits, period, this.scorecard.data.data_settings.indicator_holders, this.hidenColums);
    if (this.scorecard.data.average_selection === 'all') {
      checker = false;
    } else if (this.scorecard.data.average_selection === 'below') {
      if (this.scorecardService.findRowAverage(orgunit_id, this.periods_list, null, this.scorecard.data.data_settings.indicator_holders, this.hidenColums) >= avg) {
        checker = true;
      }
    } else if (this.scorecard.data.average_selection === 'above') {
      if (this.scorecardService.findRowAverage(orgunit_id, this.periods_list, null, this.scorecard.data.data_settings.indicator_holders, this.hidenColums) <= avg) {
        checker = true;
      }
    }
    return checker;
  }

  mouseEnter(indicator) {
    if (indicator.indicators[0].bottleneck_indicators.length !== 0) {
      this.has_bottleneck[indicator.indicators[0].id] = true;
    }
  }

  mouseLeave(indicator) {
    this.has_bottleneck[indicator.indicators[0].id] = false;
  }

  hideClicked( item , type = null) {
    this.onHideClicked.emit({ item , type});
  }

}
