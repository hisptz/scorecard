import {Component, OnInit, Input, OnDestroy, EventEmitter, Output} from '@angular/core';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {Subscription} from 'rxjs/Subscription';
import {FilterService} from '../../shared/services/filter.service';
import {Angular2Csv} from 'angular2-csv';
import {FunctionService} from '../../shared/services/function.service';
import {DataService} from '../../shared/services/data.service';
import {HttpClientService} from '../../shared/services/http-client.service';
import {VisualizerService} from '../../shared/services/visualizer.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent implements OnInit, OnDestroy {

  @Input() scorecard: any = null;
  @Input() selectedOrganisationUnit: any = null;
  @Input() selectedPeriod: any = null;
  @Input() functions: any[] = [];
  @Input() sorting_column: any = 'none';

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
  period_loading: boolean[] = [];
  period_done_loading: boolean[] = [];
  old_proccessed_percent = 0;
  proccesed_indicators = 0;
  shown_records: any;
  show_sum_in_row: boolean = false;
  // sorting scorecard by clicking the header(if two item in same list will use first item)
  current_sorting = true;
  sorting_on_progress = [];
  sorting_period = '';
  hidenColums: any[] = [];
  organisationUnitName: string = '';
  periodName: string = '';

  constructor(
    private dataService: DataService,
    private filterService: FilterService,
    private scorecardService: ScorecardService,
    private functionService: FunctionService,
    private visualizerService: VisualizerService,
    private httpService: HttpClientService
  ) {
    // this.shown_records = _.cloneDeep( this.scorecard.data.shown_records );
  }

  ngOnInit() {

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
    const orgUnits = _.clone( this.selectedOrganisationUnit);
    const period = _.clone( this.selectedPeriod);
    this.periods_list = [...this.selectedPeriod.items];
    this.organisationUnitName = this.selectedOrganisationUnit.starting_name;
    this.proccesed_indicators = 0;
    let old_proccesed_indicators = 0;
    // create a list of all indicators
    const indicator_list = this.getIndicatorList(this.scorecard, this.periods_list);
    if (this.selectedPeriod && this.selectedOrganisationUnit) {
      this.httpService.get(
        'analytics.json?dimension=pe:' + period.value + '&filter=ou:' + orgUnits.value + '&displayProperty=NAME&skipData=true'
      ).subscribe(
        (initialAnalyticsResult: any) => {
          // prepare organisation unit list to be displayed in scorecard
          for (const orgunit of initialAnalyticsResult.metaData.ou) {
            if (this.scorecard.data.show_data_in_column) {
              this.orgunits.push({
                'id': orgunit,
                'name': initialAnalyticsResult.metaData.names[orgunit],
                'is_parent': false
              });
            } else {
              this.orgunits.push({
                'id': orgunit,
                'name': initialAnalyticsResult.metaData.names[orgunit],
                'is_parent': this.selectedOrganisationUnit.items[0].id === orgunit
              });
            }
          }
          console.log(this.orgunits);

          // go through all indicators groups and then through all indicators in a group
          for ( const holder of this.scorecard.data.data_settings.indicator_holders ) {
            for (const indicator of holder.indicators) {
              if (this.level === 'top' || this.scorecard.data.is_bottleck) {
                indicator['values'] = [];
                indicator['tooltip'] = [];
                indicator['previous_values'] = [];
                indicator['showTopArrow'] = [];
                indicator['showBottomArrow'] = [];
              }

              indicator['loading'] = true;
              this.indicator_loading[indicator.id] = true;

              // go through all selected period for scorecard
              for (const current_period of period.items ) {
                this.period_loading[current_period.id] = true;
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
                        this.doneLoadingIndicator(indicator, indicator_list, current_period);
                        for (const orgunit of data.metaData.ou) {
                          const value_key = orgunit + '.' + current_period.id;
                          const data_config = [
                            {'type': 'ou', 'value': orgunit},
                            {'type': 'pe', 'value': current_period.id}];
                          indicator.values[value_key] = this.visualizerService.getDataValue(data, data_config);
                        }
                        this.shown_records = this.orgunits.length;
                        this.indicator_loading[indicator.id] = false;
                      },
                      error: (error) => {
                        console.log('error');
                        this.errorLoadingIndicator( indicator );
                      },
                      progress: (progress) => {
                        console.log('progress');
                      }
                    };
                    const execute = Function('parameters', use_function['function']);
                    execute(parameters);
                  }else { // set all values to default if the function cannot be found in store
                    this.doneLoadingIndicator( indicator, indicator_list, current_period );
                  }
                } else {
                  this.indicatorCalls.push(
                    this.dataService.getIndicatorsRequest(orgUnits.value, current_period.id, indicator.id)
                    .subscribe(
                      (data: any) => {
                        this.doneLoadingIndicator(indicator, indicator_list, current_period);
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
                              this.indicator_loading[indicator.id] = false;
                              this.indicator_done_loading[indicator.id] = true;
                              this.period_loading[current_period.id] = false;
                              this.period_done_loading[current_period.id] = true;
                              old_proccesed_indicators++;
                              this.old_proccessed_percent = (old_proccesed_indicators / indicator_list.length) * 100;
                              if (this.old_proccessed_percent === 100) {
                                // this.updatedScorecard.emit(this.scorecard);
                              }
                            })
                        );
                      },
                      error => {
                        this.indicator_loading[indicator.id] = false;
                        indicator.has_error = true;
                        old_proccesed_indicators++;
                        this.old_proccessed_percent = (old_proccesed_indicators / indicator_list.length) * 100;
                        if (this.old_proccessed_percent === 100) {
                          // this.updatedScorecard.emit(this.scorecard);
                        }
                      }
                    ));
                }
              }
            }
          }
        }, (error) => {

        }
      );
    }else {
      console.log('scorecard not loaded');
    }
    console.log('scorecard loaded');
  }

  prepareOrganisationUnitList( analytics: any ) {
    console.log(analytics);
    const orgunits = [];
    for (const orgunit of analytics.metaData.ou) {
      if (this.scorecard.data.show_data_in_column) {
        orgunits.push({
          'id': orgunit,
          'name': analytics.metaData.names[orgunit],
          'is_parent': false
        });
      } else {
        orgunits.push({
          'id': orgunit,
          'name': analytics.metaData.names[orgunit],
          'is_parent': this.selectedOrganisationUnit.items[0].id === orgunit
        });
      }
    }
    return orgunits;
  }

  doneLoadingIndicator(indicator, indicator_list, current_period) {
    indicator.loading = false;
    this.loading_message = ' Done Fetching data for ' + indicator.title + ' ' + current_period.name;
    this.proccesed_indicators++;
    this.proccessed_percent = (this.proccesed_indicators / indicator_list.length) * 100;
    if (this.proccesed_indicators === indicator_list.length) {
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


  // a function to prepare a list of indicators to pass into a table
  getIndicatorList(scorecard, period_list): string[] {
    const indicators = [];
    for (const holder of scorecard.data.data_settings.indicator_holders) {
      for (const indicator of holder.indicators) {
        for (const per of period_list) {
          indicators.push(indicator.id + ';' + per.id);
        }
      }
    }
    return indicators;
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
    const indicators = [];
    for (const indicator of holder.indicators) {
      if (this.hidenColums.indexOf(indicator.id) === -1) {
        indicators.push(indicator);
      }
    }
    return indicators;
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
    let colspan = 0;
    for (const holder of this.scorecard.data.data_settings.indicator_holders) {
      if ( group_holders.indexOf(holder.holder_id ) !== -1) {
        let hide_this: boolean = true;
        for ( const indicator of holder.indicators ) {
          if ( this.hidenColums.indexOf( indicator.id ) === -1) {
            hide_this = false;
          }
        }
        if (!hide_this) {
          for ( const per of this.periods_list ) {
            colspan++;
          }
        }
      }
    }
    return colspan;
  }

  // A function used to decouple indicator list and prepare them for a display
  getItemsFromGroups() {
    const indicators_list = [];
    for (const data of this.scorecard.data.data_settings.indicator_holder_groups) {
      for (const holders_list of data.indicator_holder_ids) {
        for (const holder of this.scorecard.data.data_settings.indicator_holders) {
          if (holder.holder_id === holders_list) {
            // check if indicators in a card are hidden so don show them
            let hide_this: boolean = true;
            for (const indicator of holder.indicators) {
              if (this.hidenColums.indexOf(indicator.id) === -1) {
                hide_this = false;
              }
            }
            if (!hide_this) {
              indicators_list.push(holder);
            }
          }
        }
      }
    }
    return indicators_list;
  }

  // A function used to decouple indicator list and prepare them for a display
  getSubscorecardColspan() {
    let indicators_list = 0;
    for (const data of this.scorecard.data.data_settings.indicator_holder_groups) {
      for (const holders_list of data.indicator_holder_ids) {
        for (const holder of this.scorecard.data.data_settings.indicator_holders) {
          if (holder.holder_id === holders_list) {
            // check if indicators in a card are hidden so don show them
            let hide_this: boolean = true;
            for (const indicator of holder.indicators) {
              if (this.hidenColums.indexOf(indicator.id) === -1) {
                hide_this = false;
              }
            }
            if (!hide_this) {
              for (const per of this.periods_list) {
                indicators_list++;
              }
            }
          }
        }
      }
    }
    return indicators_list + 1;
  }

  // simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string {
    const title = [];
    for (const data of holder.indicators) {
      if (this.hidenColums.indexOf(data.id) === -1) {
        title.push(data.title);
      }
    }
    return title.join(' / ');
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

  getCorrectColspan() {
    let i = 0;
    if (this.scorecard.data.show_sum_in_row) {
      i++;
    }
    if (this.scorecard.data.show_average_in_row) {
      i++;
    }
    if (this.scorecard.data.show_rank) {
      i++;
    }
    return i;
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
    this.sorting_on_progress[this.sorting_column] = true;
    sortAscending = this.current_sorting;
    if (sortingColumn === 'none') {
      this.dataService.sortArrOfObjectsByParam(orguUnits, 'name', sortAscending)
    } else if (sortingColumn === 'avg') {
      for (const orgunit of orguUnits) {
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id, this.periods_list, null));
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    } else if (sortingColumn === 'sum') {
      for (const orgunit of orguUnits) {
        orgunit['sum'] = this.findRowSum(orgunit.id, period);
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    } else {
      for (const orgunit of orguUnits) {
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn, period);
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    this.sorting_on_progress[this.sorting_column] = false;
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

  // findinf a proper row-span for no, average and additional labels
  getCurrentRowsPan(): number {
    if (this.periods_list.length === 1 || this.periods_list.length === 0) {
      return 1;
    } else if (this.periods_list.length > 1) {
      return 2;
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
