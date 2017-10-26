import {Component, OnInit, Input, OnDestroy, EventEmitter, Output, ViewChild} from '@angular/core';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {Subscription} from 'rxjs/Subscription';
import {FilterService} from '../../shared/services/filter.service';
import {Angular2Csv} from 'angular2-csv';
import {FunctionService} from '../../shared/services/function.service';
import {DataService} from '../../shared/services/data.service';
import {HttpClientService} from '../../shared/services/http-client.service';
import {VisualizerService} from '../../shared/services/visualizer.service';

import * as _ from 'lodash';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ScoreCard} from '../../shared/models/scorecard';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css'],
  animations: [
    trigger('hiddenItem', [
      state('notHidden' , style({
        'transform': 'scale(1, 1)'
      })),
      state('hidden', style({
        'transform': 'scale(0.0, 0.00)',
        'visibility': 'hidden',
        'height': '0px'
      })),
      transition('notHidden <=> hidden', animate('500ms'))
    ])

  ]
})
export class ScorecardComponent implements OnInit, OnDestroy {

  @Input() scorecard: any = null;
  @Input() selectedOrganisationUnit: any = null;
  @Input() selectedPeriod: any = null;
  @Input() functions: any[] = [];
  @Input() sorting_column: any = 'none';
  @Input() is_children = false;

  // Event emmiter to use once the data area in scorecard is clicked
  @Output() show_details = new EventEmitter<any>();
  // use this when loading children scorecard during drilldown
  @Input() level: string = 'top';

  private indicatorCalls: Subscription[] = [];
  searchQuery: string = '';
  orgunits: any[] = [];
  proccessed_percent = 0;
  loading: boolean = true;
  loading_message: string;
  base_url: string;
  showSubScorecard: any[] = [];
  periods_list: any = [];
  keep_options_open: boolean = true;
  indicator_loading: boolean[] = [];
  indicator_done_loading: boolean[] = [];
  has_error: boolean[] = [];
  period_loading: boolean[] = [];
  period_done_loading: boolean[] = [];
  old_proccessed_percent = 0;
  proccesed_indicators = 0;
  shown_records: any;
  show_sum_in_row: boolean = false;
  // sorting scorecard by clicking the header(if two item in same list will use first item)
  current_sorting = true;
  sortAscending: boolean = true;
  sorting_on_progress = [];
  sorting_period = '';
  hidenColums: any[] = [];
  organisationUnitName: string = '';
  periodName: string = '';
  allIndicatorsLength = 0;
  children_available: boolean[] = [];
  subscorecard: any;
  sub_unit: any;
  sub_model: any;
  periodListFromAnalyicts: any;


  constructor(
    private dataService: DataService,
    private filterService: FilterService,
    private scorecardService: ScorecardService,
    private functionService: FunctionService,
    private visualizerService: VisualizerService,
    private httpService: HttpClientService
  ) {}

  ngOnInit() {
    if (this.is_children) {
      this.loadScoreCard();
    }
  }

  // load scorecard after changes has occur
  loadScoreCard() {
    this.showSubScorecard = [];
    this.periods_list = [];
    this.indicator_done_loading = [];
    this.proccessed_percent = 0;
    this.loading = true;
    this.orgunits = [];
    this.loading_message = ' Getting scorecard details ';
    const orgUnits: any = { ...this.selectedOrganisationUnit };
    const period: any = { ...this.selectedPeriod };
    this.periods_list = [...this.selectedPeriod.items];
    this.organisationUnitName = orgUnits.starting_name + ' ' + orgUnits.items.map((ou: any) => ou.name).join(', ');
    this.periodName = period.items.map((pe: any) => pe.name).join(', ');
    this.proccesed_indicators = 0;
    let old_proccesed_indicators = 0;
    // create a list of all indicators
    const allIndicators = _.flatten(_.map(this.scorecard.data.data_settings.indicator_holders, (holder: any) => holder.indicators ));
    if (period && orgUnits) {
      this.httpService.get(
        'analytics.json?dimension=pe:' + period.value + '&filter=ou:' + orgUnits.value + '&displayProperty=NAME&skipData=true'
      ).subscribe(
        (initialAnalyticsResult: any) => {
          // prepare organisation unit list to be displayed in scorecard
          this.orgunits = _.map(initialAnalyticsResult.metaData.ou, (ou: any) => {
            return {
              'id': ou,
              'name': initialAnalyticsResult.metaData.names[ou],
              'is_parent': (this.scorecard.data.show_data_in_column) ? false : orgUnits.items[0].id === ou
            };
          });
          // Prepare a list of period to use from analytics this will help to cover the relative period issue
          this.periods_list = _.map(initialAnalyticsResult.metaData.pe, (pe: any) => {
            return {
              'id': pe,
              'name': initialAnalyticsResult.metaData.names[pe]
            };
          });
          this.allIndicatorsLength = allIndicators.length * this.periods_list.length;
          // go through all indicators groups and then through all indicators in a group
          _.each(this.scorecard.data.data_settings.indicator_holders , (holder: any) => {
            holder.title = this.getIndicatorTitle(holder);
            _.each(holder.indicators, (indicator: any) => {
              if (this.level === 'top' || this.scorecard.data.is_bottleck) {
                indicator['values'] = indicator.hasOwnProperty('values') ? indicator.values : [];
                indicator['tooltip'] =  indicator.hasOwnProperty('tooltip') ? indicator.tooltip : [];
                indicator['previous_values'] =  indicator.hasOwnProperty('previous_values') ? indicator.previous_values : [];
                indicator['showTopArrow'] =   [];
                indicator['showBottomArrow'] =  [];
              }

              // go through all selected period for scorecard
              _.each(this.periods_list, (current_period: any) => {
                const loading_key = indicator.id + current_period.id;
                this.indicator_loading[loading_key] = true;
                // check if the indicator is supposed to come from function
                if (indicator.hasOwnProperty('calculation') && indicator.calculation === 'custom_function') {
                  const use_function = this.getFunction(indicator.function_to_use);
                  // Check first if the function still exist in maintenance
                  if (use_function) {
                    const parameters = {
                      dx: indicator.id,
                      ou: orgUnits.values,
                      pe: current_period.id,
                      rule: this.getFunctionRule(use_function['rules'], indicator.id),
                      success: (data) => { // This will run on successfull function return, which will save the result to the data store for analytics
                        this.doneLoadingIndicator(indicator, this.allIndicatorsLength, current_period);
                        for (const orgunit of data.metaData.ou) {
                          const value_key = orgunit + '.' + current_period.id;
                          const data_config = [
                            {'type': 'ou', 'value': orgunit},
                            {'type': 'pe', 'value': current_period.id}];
                          indicator.values[value_key] = this.visualizerService.getDataValue(data, data_config);
                        }
                        this.shown_records = this.orgunits.length;
                        this.indicator_loading[loading_key] = false;
                      },
                      error: (error) => {
                        this.errorLoadingIndicator( indicator );
                        indicator.has_error = true;
                      },
                      progress: (progress) => {}
                    };
                    const execute = Function('parameters', use_function['function']);
                    execute(parameters);
                  }else { // set all values to default if the function cannot be found in store
                    this.doneLoadingIndicator( indicator, this.allIndicatorsLength, current_period );
                  }
                } else {
                  this.indicatorCalls.push(
                    this.dataService.getIndicatorsRequest(orgUnits.value, current_period.id, indicator.id)
                    .subscribe(
                      (data: any) => {
                        this.doneLoadingIndicator(indicator, this.allIndicatorsLength, current_period);
                        for (const orgunit of data.metaData.ou) {
                          const value_key = orgunit + '.' + current_period.id;
                          const data_config = [{'type': 'ou', 'value': orgunit}, {'type': 'pe', 'value': current_period.id}];
                          indicator.values[value_key] = this.visualizerService.getDataValue(data, data_config);
                        }
                        this.shown_records = this.orgunits.length;
                        // load previous data
                        const effective_gap = parseInt(indicator.arrow_settings.effective_gap);
                        this.indicatorCalls.push(this.dataService.getIndicatorsRequest(orgUnits.value, this.filterService.getLastPeriod( current_period.id ), indicator.id)
                          .subscribe(
                            (olddata: any) => {
                              for (const prev_orgunit of this.orgunits) {
                                const prev_key = prev_orgunit.id + '.' + current_period.id;
                                indicator.previous_values[prev_key] = this.dataService.getIndicatorData(prev_orgunit.id, this.filterService.getLastPeriod( current_period.id ), olddata);
                              }
                              if (indicator.hasOwnProperty('arrow_settings')) {
                                for (const key in indicator.values) {
                                  if ( indicator.values.hasOwnProperty( key ) ) {
                                    const splited_key = key.split('.');
                                    if (parseInt(indicator.previous_values[key]) !== 0) {
                                      const checkTopArrow = parseInt(indicator.values[key]) > (parseInt(indicator.previous_values[key]) + effective_gap );
                                      const checkBottomArror = parseInt(indicator.values[key]) < (parseInt(indicator.previous_values[key]) - effective_gap );
                                      indicator.showTopArrow[key] = checkTopArrow;
                                      indicator.showBottomArrow[key] = checkBottomArror;
                                      if (indicator.showTopArrow[key] && indicator.values[key] !== null && indicator.previous_values[key] !== null && olddata.metaData.names.hasOwnProperty(splited_key[0])) {
                                        const changeInValue = indicator.values[key] - parseInt(indicator.previous_values[key]);
                                        indicator.tooltip[key] = indicator.title + ' has raised by ' + changeInValue.toFixed(2) + ' from ' + this.filterService.getPeriodName(current_period.id) + ' for ' + data.metaData.names[splited_key[0]] + ' (Minimum gap ' + indicator.arrow_settings.effective_gap + ')';
                                      }
                                      if (indicator.showBottomArrow[key] && indicator.values[key] !== null && indicator.previous_values[key] !== null && olddata.metaData.names.hasOwnProperty(splited_key[0])) {
                                        const changeInValue = parseFloat(indicator.previous_values[key]) - indicator.values[key];
                                        indicator.tooltip[key] = indicator.title + ' has decreased by ' + changeInValue.toFixed(2) + ' from ' + this.filterService.getPeriodName(current_period.id) + ' for ' + data.metaData.names[splited_key[0]] + ' (Minimum gap ' + indicator.arrow_settings.effective_gap + ')';
                                      }
                                    }
                                  }
                                }
                              }
                              this.indicator_loading[loading_key] = false;
                              this.indicator_done_loading[loading_key] = true;
                              old_proccesed_indicators++;
                              this.old_proccessed_percent = (old_proccesed_indicators / this.allIndicatorsLength) * 100;
                              if (this.old_proccessed_percent === 100) {
                                // this.updatedScorecard.emit(this.scorecard);
                              }
                            })
                        );
                      },
                      error => {
                        this.indicator_loading[loading_key] = false;
                        this.has_error[loading_key] = true;
                        this.doneLoadingIndicator(indicator, this.allIndicatorsLength, current_period);
                        this.indicator_done_loading[loading_key] = true;
                        old_proccesed_indicators++;
                        this.old_proccessed_percent = (old_proccesed_indicators / this.allIndicatorsLength) * 100;
                        if (this.old_proccessed_percent === 100) {
                          // this.updatedScorecard.emit(this.scorecard);
                        }
                      }
                    ));
                }
              });
            });
          });
        }, (error) => {

        }
      );
    }else {
      console.log('scorecard not loaded');
    }
    console.log('scorecard loaded');
  }

  doneLoadingIndicator(indicator, totalIndicators, current_period) {
    indicator.loading = false;
    this.loading_message = ' Done Fetching data for ' + indicator.title + ' ' + current_period.name;
    this.proccesed_indicators++;
    this.proccessed_percent = (this.proccesed_indicators / totalIndicators) * 100;
    if (this.proccesed_indicators === totalIndicators) {
      this.loading = false;
    }
  }

  errorLoadingIndicator( indicator ) {

  }

  initiateScorecard( period, orgunit ) {
    this.selectedPeriod = period;
    this.selectedOrganisationUnit = orgunit;
    this.loadScoreCard();
  }

  // get function details from id
  getFunction(id) {
    let return_function = null;
    this.functions.forEach((funct) => {
      if (id === funct.id) {
        return_function = funct;
      }
    });
    return return_function;
  }

  // get rule from a function details from id
  getFunctionRule(rules, id) {
    let return_rule = null;
    rules.forEach((funct) => {
      if (id === funct.id) {
        return_rule = funct;
        if (typeof return_rule.json === 'string') {
          return_rule.json = JSON.parse(return_rule.json);
        }
      }
    });
    return return_rule;
  }

  // prepare scorecard data and download them as csv
  downloadCSV() {
    const data = [];
    for (const current_orgunit of this.orgunits) {
      const dataobject = {};
      dataobject['orgunit'] = current_orgunit.name;
      for (const holder of this.scorecard.data.data_settings.indicator_holders) {
        for (const indicator of holder.indicators) {
          for (const current_period of this.periods_list) {
            const value_key = current_orgunit.id + '.' + current_period.id;
            const name = ( this.periods_list.length > 1) ? indicator.title + ' ' + current_period.name : indicator.title;
            dataobject[name] = indicator.values[value_key];
          }
        }

      }
      data.push(dataobject);
    }

    const options = {
      fieldSeparator: ',',
      quoteStrings: '\'',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular2Csv(data, 'My Report', options);
  }

  // get number of visible indicators from a holder
  getVisibleIndicators(holder) {
    return _.filter(holder.indicators, (indicator: any) => !_.includes(this.hidenColums, indicator.id));
  }

  // helper function to set label value( helpful when there is more than one indicator)
  getIndicatorLabel(indicator, label) {
    const labels = [];
    for (const data of indicator.indicators) {
      if (data.additional_label_values[label] !== null && data.additional_label_values[label] !== '' && this.hidenColums.indexOf(data.id) === -1) {
        labels.push(data.additional_label_values[label]);
      }
    }
    return labels.join(' / ');
  }

  // helper function to dynamical provide colspan attribute for a group
  getGroupColspan(group_holders) {
    return _.filter(this.scorecard.data.data_settings.indicator_holders, (holder: any) => {
        return _.includes(group_holders, holder.holder_id)
          && _.difference(_.map(holder.indicators, ((indicator: any) => indicator.id)), this.hidenColums).length !== 0;
      }).length * this.periods_list.length;
  }

  // A function used to decouple indicator list and prepare them for a display
  getItemsFromGroups() {
    let indicators_list = [];
    _.each(this.scorecard.data.data_settings.indicator_holder_groups, (group: any) => {
      indicators_list = [...indicators_list, ..._.map(group.indicator_holder_ids, (holder_id) => {
        return _.find(_.filter(this.scorecard.data.data_settings.indicator_holders,
          (holder: any) => _.difference(_.map(holder.indicators, (indicator: any) => indicator.id), this.hidenColums).length !== 0)
          , {'holder_id': holder_id});
      })];
    });
    return indicators_list;
  }

  // A function used to decouple indicator list and prepare them for a display
  getSubscorecardColspan() {
    let indicators_list = 0;
    for (const holder_group of this.scorecard.data.data_settings.indicator_holder_groups) {
      indicators_list += this.getGroupColspan(holder_group.indicator_holder_ids);
    }
    if (this.scorecard.data.show_sum_in_row) {
      indicators_list++;
    }
    if (this.scorecard.data.show_average_in_row) {
      indicators_list++;
    }
    if (this.scorecard.data.show_rank) {
      indicators_list++;
    }
    return indicators_list + 1;
  }

  // simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string {
    return _.map(_.filter(holder.indicators, (indicator: any) => this.hidenColums.indexOf(indicator.id) === -1), (indicator: any) => indicator.title).join(' / ');
  }

  // a function to prepare a list of indicators to pass into a table
  getIndicatorsList(scorecard): string[] {
    const indicators = [];
    for (const holder of scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        indicators.push(indicator);
      }
    }
    return indicators;
  }

  // check if a column is empty
  isRowEmpty(orgunit_id: string): boolean {
    let checker = false;
    let sum = 0;
    let counter = 0;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        if (this.hidenColums.indexOf(indicator.id) === -1) {
          sum++;
        }
        if (this.hidenColums.indexOf(indicator.id) === -1 && indicator.values[orgunit_id] === null) {
          counter++;
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
    const avg = this.findRowTotalAverage(this.orgunits, period);
    if (this.scorecard.data.average_selection === 'all') {
      checker = false;
    } else if (this.scorecard.data.average_selection === 'below') {
      if (this.findRowAverage(orgunit_id, this.periods_list, null) >= avg) {
        checker = true;
      }
    } else if (this.scorecard.data.average_selection === 'above') {
      if (this.findRowAverage(orgunit_id, this.periods_list, null) <= avg) {
        checker = true;
      }
    }
    return checker;
  }

  // check if column is empty
  isEmptyColumn(orgunits, indicator_id, scorecard) {
    let sum = 0;
    for (const orgunit of orgunits) {
      for (const holder of scorecard.data.data_settings.indicator_holders) {
        for (const indicator of holder.indicators) {
          if (indicator.id === indicator_id && indicator.values[orgunit.id] === null) {
            sum++;
          }
        }
      }
    }
    if (sum === orgunits.length) {

    }
  }

  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowAverage(orgunit_id, periods_list, period) {
    let sum = 0;
    let counter = 0;
    if (period === null) {
      for (const holder of this.scorecard.data.data_settings.indicator_holders) {
        for (const indicator of holder.indicators) {
          for (const per of periods_list) {
            const use_key = orgunit_id + '.' + per.id;
            if (this.hidenColums.indexOf(indicator.id) === -1 && indicator.values[use_key] !== null) {
              counter++;
              sum = sum + parseFloat(indicator.values[use_key]);
            }
          }
        }
      }
    } else {
      let use_key = orgunit_id + '.' + period;
      for (let holder of this.scorecard.data.data_settings.indicator_holders) {
        for (let indicator of holder.indicators) {
          if (this.hidenColums.indexOf(indicator.id) === -1 && indicator.values[use_key] !== null) {
            counter++;
            sum = sum + parseFloat(indicator.values[use_key]);
          }
        }
      }
    }

    return (sum / counter).toFixed(2);
  }

  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowTotalAverage(orgunits, period) {
    let sum = 0;
    let n = 0;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        if (this.hidenColums.indexOf(indicator.id) === -1) {
          for (const orgunit of orgunits) {
            const usekey = orgunit.id + '.' + period;
            if (usekey in indicator.values && indicator.values[usekey] !== null) {
              n++;
              sum = sum + parseFloat(indicator.values[usekey]);
            }
          }
        }
      }
    }
    return (sum / n).toFixed(2);
  }

  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowTotalSum(orgunits, period) {
    let sum = 0;
    let n = 0;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        if (this.hidenColums.indexOf(indicator.id) === -1) {
          for (const orgunit of orgunits) {
            const use_key = orgunit.id + '.' + period;
            if (orgunit.id in indicator.values && indicator.values[use_key] !== null) {
              n++;
              sum = sum + parseFloat(indicator.values[use_key]);
            }
          }
        }
      }
    }
    return sum;
  }

  /**
   * Finding avarage for the column
   * @param orgunits, indicator_id
   */
  findColumnAverage(orgunits, indicator_id, scorecard) {
    let sum = 0;
    for (const orgunit of orgunits) {
      for (const holder of scorecard.data.data_settings.indicator_holders) {
        for (const indicator of holder.indicators) {
          if (orgunit.id in indicator.values && indicator.id === indicator_id) {
            sum = sum + parseFloat(indicator.values[orgunit.id]);
          }
        }
      }
    }
    return (sum / this.getIndicatorsList(this.scorecard).length).toFixed(2);
  }

  /**
   * Finding avarage for the column
   * @param orgunits, indicator_id
   */
  findColumnSum(orgunits, indicator_id, scorecard) {
    let sum = 0;
    for (const orgunit of orgunits) {
      for (const holder of scorecard.data.data_settings.indicator_holders) {
        for (const indicator of holder.indicators) {
          if (orgunit.id in indicator.values && indicator.id === indicator_id) {
            sum = sum + parseFloat(indicator.values[orgunit.id]);
          }
        }
      }
    }
    return sum;
  }

  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowSum(orgunit_id: string, period: string) {
    let sum = 0;
    const use_key = orgunit_id + '.' + period;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        if (orgunit_id in indicator.values && indicator.values[use_key] !== null) {
          if (this.hidenColums.indexOf(indicator.id) === -1) {
            sum = sum + parseFloat(indicator.values[use_key]);
          }
        }
      }
    }
    return sum;
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


  getCursorStyle(orgunit) {
    if (orgunit.is_parent) {
      return 'default';
    } else {
      return 'pointer';
    }
  }

  // sorting scorecard by clicking the header(if two item in same list will use first item)
  sortScoreCardFromColumn(sortingColumn, sortAscending, orguUnits, period: string, lower_level: boolean = true) {
    this.current_sorting = !this.current_sorting;
    this.sorting_column = sortingColumn;
    this.sorting_period = period;
    sortAscending = (this.current_sorting) ? 'asc' : 'desc';
    if (sortingColumn === 'none') {
      this.orgunits = _.orderBy(this.orgunits, ['name'], [sortAscending]);
    } else if (sortingColumn === 'avg') {
      for (const orgunit of this.orgunits) {
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id, this.periods_list, null));
      }
      this.orgunits = _.orderBy(this.orgunits, [sortingColumn, 'name'], [sortAscending, 'asc']);
    } else if (sortingColumn === 'sum') {
      for (const orgunit of this.orgunits) {
        orgunit['sum'] = this.findRowSum(orgunit.id, period);
      }
      this.orgunits = _.orderBy(this.orgunits, [sortingColumn, 'name'], [sortAscending, 'asc']);
    } else {
      for (const orgunit of this.orgunits) {
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn, period);
      }
      this.orgunits = _.orderBy(this.orgunits, [sortingColumn, 'name'], [sortAscending, 'asc']);
    }
    this.sorting_column = (lower_level) ? 'none' : sortingColumn;
  }

  // hack to find a value of indicator for a specific orgunit
  private findOrgunitIndicatorValue(orgunit_id: string, indicator_id: string, period: string) {
    let val: number = 0;
    const use_key = orgunit_id + '.' + period;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        if (use_key in indicator.values && indicator.values[use_key] !== null && indicator.id === indicator_id) {
          val = parseFloat(indicator.values[use_key]);
        }
      }
    }
    return val;
  }

  // load a preview function
  loadPreview(holderGroup, indicator, ou, period) {
    // emit the array with these items;
    this.show_details.emit({
      holderGroup: holderGroup,
      indicator: indicator,
      ou: ou,
      period: period,
      functions: this.functions
    });
  }

  // load a preview function when event
  loadPreviewFromChild($event) {
    // emit the array with these items;
    this.show_details.emit({
      holderGroup: $event.holderGroup,
      indicator: $event.indicator,
      ou: $event.ou
    });
  }

  // deals with the drag and drop issue
  dragItemSuccessfull($event, drop_area: string, object: any) {
    if (drop_area === 'orgunit') {
      if ($event.dragData.hasOwnProperty('holder_id')) {
        this.scorecard.data.show_data_in_column = !this.scorecard.data.show_data_in_column;
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
        this.scorecard.data.show_data_in_column = !this.scorecard.data.show_data_in_column;
      } else {
        const number = (this.getOrgunitPosition($event.dragData.id) > this.getOrgunitPosition(object.id)) ? 0 : 1;
        this.deleteOrgunit($event.dragData);
        this.insertOrgunit($event.dragData, object, number);
      }
    } else if (drop_area === 'indicator') {
      if ($event.dragData.hasOwnProperty('holder_id')) {
        if ($event.dragData.holder_id === object.holder_id) {
          console.log('cant move item to itself');
        } else {
          const position = this.getHolderPosition($event.dragData, object);
          this.deleteHolder($event.dragData);
          this.insertHolder($event.dragData, object, position);
        }
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
      } else {
        this.scorecard.data.show_data_in_column = !this.scorecard.data.show_data_in_column;
      }
    } else if (drop_area === 'group') {
      if ($event.dragData.hasOwnProperty('holder_id')) {
        const last_holder = ( object.indicator_holder_ids.length === 0 ) ? 0 : object.indicator_holder_ids.length - 1;
        if (object.indicator_holder_ids.indexOf($event.dragData.holder_id) === -1) {
          this.deleteHolder($event.dragData);
          this.insertHolder($event.dragData, this.getHolderById(object.indicator_holder_ids[last_holder]), 1);
        } else {
        }
      } else if ($event.dragData.hasOwnProperty('indicator_holder_ids')) {
        if ($event.dragData.id !== object.id) {
          this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, group_index) => {
            if (group.id === $event.dragData.id) {
              this.scorecard.data.data_settings.indicator_holder_groups.splice(group_index, 1);
            }
          });
          this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, group_index) => {
            if (group.id === object.id && this.getgroupById($event.dragData.id) === null) {
              this.scorecard.data.data_settings.indicator_holder_groups.splice(group_index, 0, $event.dragData);
            }
          });
        }
      } else {
        this.scorecard.data.show_data_in_column = !this.scorecard.data.show_data_in_column;
      }
    } else {
    }
  }

  // get indicator group by Id this function helps to check if the group is available or not
  getgroupById(group_id) {
    let return_id = null;
    for (const group of this.scorecard.data.data_settings.indicator_holder_groups) {
      if (group.id === group_id) {
        return_id = group;
        break;
      }
    }
    return return_id;
  }

  // this function will return an holder with specified ID
  getHolderById(holder_id) {
    let return_id = null;
    for (let holder of this.scorecard.data.data_settings.indicator_holders) {
      if (holder.holder_id === holder_id) {
        return_id = holder;
        break;
      }
    }
    return return_id;
  }

  // This function will find the location of holder in the group and delete it
  deleteHolder(holder_to_delete) {
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, holder_index) => {
      group.indicator_holder_ids.forEach((holder, indicator_index) => {
        if (holder === holder_to_delete.holder_id) {
          group.indicator_holder_ids.splice(indicator_index, 1);
        }
      });
    });
  }

  // This function will add a new holder in the place of the current holder
  insertHolder(holder_to_insert, current_holder, num: number) {
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, holder_index) => {
      group.indicator_holder_ids.forEach((holder, indicator_index) => {
        if (holder === current_holder.holder_id && group.indicator_holder_ids.indexOf(holder_to_insert.holder_id) === -1) {
          group.indicator_holder_ids.splice(indicator_index + num, 0, holder_to_insert.holder_id);
        }
      });
    });
  }

  // Dertimine if indicators are in the same group and say whether the first is larger of not
  getHolderPosition(holder_to_check, current_holder) {
    let holders_in_same_group = false;
    let holder_group = null;
    let increment_number = 0;
    this.scorecard.data.data_settings.indicator_holder_groups.forEach((group, holder_index) => {
      if (group.indicator_holder_ids.indexOf(holder_to_check.holder_id) !== -1 && group.indicator_holder_ids.indexOf(current_holder.holder_id) !== -1) {
        holders_in_same_group = true;
        holder_group = group.indicator_holder_ids;
      }
    });
    if (holders_in_same_group) {
      if (holder_group.indexOf(holder_to_check.holder_id) > holder_group.indexOf(current_holder.holder_id)) {
        increment_number = 0;
      } else {
        increment_number = 1;
      }
    }
    return increment_number;
  }

  // this function will delete orgunit from the list of organisation units
  deleteOrgunit(orgunit_to_delete) {
    this.orgunits.forEach((orgunit, orgunit_index) => {
      if (orgunit_to_delete.id === orgunit.id) {
        this.orgunits.splice(orgunit_index, 1);
      }
    });
  }

  // This function will add orgunit in the behind of the provided orgunit
  insertOrgunit(orgunit_to_insert, current_orgunit, num: number) {
    this.orgunits.forEach((orgunit, orgunit_index) => {
      if (current_orgunit.id === orgunit.id && !this.orgunitAvailable(orgunit_to_insert.id)) {
        this.orgunits.splice(orgunit_index + num, 0, orgunit_to_insert);
      }
    });
  }

  // This function is used to check if Organisation unit is available
  orgunitAvailable(orgunit_id: string): boolean {
    let checker = false;
    this.orgunits.forEach((orgunit, orgunit_index) => {
      if (orgunit_id === orgunit.id) {
        checker = true;
      }
    });
    return checker;
  }

  // Get the position of the organisation unit.
  getOrgunitPosition(orgunit_id) {
    let orgunit_index = null;
    this.orgunits.forEach((orgunit, index) => {
      if (orgunit.id === orgunit_id) {
        orgunit_index = index;
      }
    });
    return orgunit_index;
  }

  // deduce items to use for subscorecard analytics
  getOrganisationUnitForAnalytics(selectedorgunit) {
    const orgUnits = [];
    const detailed_orgunit = this.selectedOrganisationUnit.orgtree.treeModel.getNodeById(selectedorgunit.id);
    orgUnits.push(detailed_orgunit.id);
    if (detailed_orgunit.hasOwnProperty('children')) {
      for ( const orgunit of detailed_orgunit.children ) {
        orgUnits.push(orgunit.id);
      }
    }
    return orgUnits.join(';');
  }

  loadChildrenData(selectedorgunit, indicator) {
    this.subscorecard = Object.assign({}, this.scorecard);
    if (indicator === null) {
      if (selectedorgunit.is_parent || this.showSubScorecard[selectedorgunit.id]) {
        this.showSubScorecard = [];
      }else {
        this.showSubScorecard[selectedorgunit.id] = true;
        const orgunit_with_children = this.selectedOrganisationUnit.orgtree.treeModel.getNodeById(selectedorgunit.id);
        this.sub_unit = orgunit_with_children.data;
        this.sub_model = {
          ...this.selectedOrganisationUnit ,
          items: [selectedorgunit],
          value: this.getOrganisationUnitForAnalytics( selectedorgunit )
        };
        if (this.sub_unit.hasOwnProperty('children')) {
          this.children_available[selectedorgunit.id] = true;
        } else {
          setTimeout(function () {
            this.showSubScorecard = [];
          }, 5000);
        }

      }
    }
    if (selectedorgunit === null) {

      if (this.showSubScorecard[indicator.id]) {
        this.showSubScorecard = [];
      }else {
        this.scorecardService.getRelatedIndicators(indicator.id).subscribe(
          (data: any) => {
            if (data.length === 0) {
              this.children_available[indicator.id] = false;
              this.showSubScorecard[indicator.id] = true;
            } else {
              this.children_available[indicator.id] = true;
              console.log(indicator)
              // this.subscorecard = this.createScorecardByIndicators(indicator,indicator.bottleneck_indicators);
              const created_scorecard = this.scorecardService.getEmptyScoreCard();
              const legendSet = indicator.legendset;
              const holder_ids = [];
              data.forEach((item, item_index) => {
                // check first if it is a function or not
                const indicator_structure = this.scorecardService.getIndicatorStructure(item.name, item.id, legendSet, item.bottleneck_title);
                if (item.hasOwnProperty('function')) {
                  indicator_structure.calculation = 'custom_function';
                  indicator_structure.function_to_use = item.function;
                } else {
                  indicator_structure.calculation = 'analytics';
                }
                const indicator_holder = {
                  'holder_id': item_index + 1,
                  'indicators': [
                    indicator_structure
                  ]
                };
                holder_ids.push(item_index + 1);
                created_scorecard.data.data_settings.indicator_holders.push(indicator_holder);
              });

              created_scorecard.data.data_settings.indicator_holder_groups = [{
                'id': '1',
                'name': 'New Group',
                'indicator_holder_ids': holder_ids,
                'background_color': '#ffffff',
                'holder_style': null
              }];
              created_scorecard.data.show_data_in_column = true;
              created_scorecard.data.is_bottleck = true;
              created_scorecard.data.name = 'Related Indicators for ' + indicator.name;
              created_scorecard.data.header.title = 'Related Indicators for ' + indicator.name;
              this.subscorecard = created_scorecard;
              this.showSubScorecard[indicator.id] = true;
            }

          },
          (error) => {
            this.children_available[indicator.id] = false;
            this.showSubScorecard[indicator.id] = true;
          }
        );
      }
    }

  }


  // Use this for all clean ups
  ngOnDestroy () {
    for (const subscr of this.indicatorCalls) {
      if (subscr) {
        subscr.unsubscribe();
      }
    }
  }


}
