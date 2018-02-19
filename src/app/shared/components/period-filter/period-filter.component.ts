import {
  Component, OnInit, Output, Input, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import {animate, group, state, style, transition, trigger} from '@angular/animations';
import * as _ from 'lodash';

const PERIOD_TYPE: Array<any> = [
  {value: 'Monthly', name: 'Monthly', shown: true},
  {value: 'BiMonthly', name: 'BiMonthly', shown: true},
  {value: 'Quarterly', name: 'Quarterly', shown: true},
  {value: 'SixMonthly', name: 'Six-Monthly', shown: false},
  {value: 'SixMonthlyApril', name: 'Six-Monthly April', shown: false},
  {value: 'Yearly', name: 'Yearly', shown: true},
  {value: 'FinancialApril', name: 'Financial-April', shown: true},
  {value: 'FinancialJuly', name: 'Financial-July', shown: true},
  {value: 'FinancialOct', name: 'Financial-Oct', shown: false},
  {value: 'RelativeMonth', name: 'Relative Month', shown: true},
  {value: 'RelativeBiMonth', name: 'Relative Bi-Month', shown: true},
  {value: 'RelativeQuarter', name: 'Relative Quarter', shown: true},
  {value: 'RelativeSixMonthly', name: 'Relative Six Monthly', shown: true},
  {value: 'RelativeYear', name: 'Relative Year', shown: true},
  {value: 'RelativeFinancialYear', name: 'Relative Financial Year', shown: true},
];


@Component({
  selector: 'app-period-filter',
  templateUrl: './period-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./period-filter.component.css'],
  animations: [
    trigger('showOption', [
      state('hidden', style(
        {'opacity': 0.1, 'transform': 'translateY(-50px)', 'max-height': '50px', 'display': 'none'}
      )),
      state('shown', style(
        {opacity: 1, transform: 'translateY(0)'}
      )),
      transition('hidden => shown', [
        group([
          animate('150ms', style({transform: 'translateY(0)'})),
          animate('200ms', style({opacity: 1})),
          animate('150ms', style({'max-height': '360px'}))
        ])
      ]),
      transition('shown => hidden', [
        group([
          animate('50ms', style({transform: 'translateY(0)', opacity: 1})),
          animate('20ms', style({'display': 'none'})),
          animate('50ms', style({'max-height': '30px'}))
        ])
      ])
    ])
  ]
})
export class PeriodFilterComponent implements OnInit {

  @Input() period_tree_config: any = {
    show_search : false,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: false,
    multiple_key: 'none', // can be control or shift
    starting_periods: [],
    starting_year: null,
    placeholder: 'Select period'
  };
  @Input() selected_periods: any[] = [];
  @Input() period_type: string = 'Monthly';
  @Input() starting_year: number = new Date().getFullYear();
  @Input() showUpdate: boolean = false;
  @Output() onPeriodUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output() onPeriodChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onYearUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output() onTypeUpdate: EventEmitter<any> = new EventEmitter<any>();
  periods = [];
  period: any = {};
  showPerTree: boolean = true;
  year: number = new Date().getFullYear();
  period_type_config: Array<any>;

  constructor() {
    const date = new Date();
    date.setDate(0);
    this.period_tree_config.starting_year = date.getFullYear();
    this.year = (this.period_tree_config.starting_year) ? this.period_tree_config.starting_year : date.getFullYear();
    const datestring = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
    this.period_tree_config.starting_periods = [datestring];
    if (!this.period_tree_config.hasOwnProperty('multiple_key')) {
      this.period_tree_config.multiple_key = 'none';
    }

  }


  ngOnInit() {

    this.period_type_config = PERIOD_TYPE;
    if (this.period_type !== '') {
      this.changePeriodType();
      this.emitPeriod(false);
    }

    // this.getRelativePeriodText('LAST_5_YEARS');
  }

  displayPerTree() {
    this.showPerTree = !this.showPerTree;
  }

  transferDataSuccess(data, current) {
    if (data.dragData.id === current.id) {
    }else {
      const number = (this.getPeriodPosition(data.dragData.id) > this.getPeriodPosition(current.id)) ? 0 : 1;
      this.deletePeriod( data.dragData );
      this.insertPeriod( data.dragData, current, number);
      this.emitPeriod(false);
    }
  }

  // transfer all period to selected section
  selectAllItems() {
    this.periods.forEach((item) => {
      if (!this.checkPeriodAvailabilty(item, this.selected_periods )) {
        this.selected_periods = [...this.selected_periods, item];
      }
    });
    this.emitPeriod(false);
  }

  deselectAllItems() {
    this.selected_periods = [];
      this.emitPeriod(false);
  }

  // helper method to find the index of dragged item
  getPeriodPosition(period_id) {
    let period_index = null;
    this.selected_periods.forEach((period, index) => {
      if (period.id === period_id) {
        period_index = index;
      }
    });
    return period_index;
  }

  updatePeriods() {
    this.emitPeriod(true);
    this.showPerTree = true;
  }

  // help method to delete the selected period in list before inserting it in another position
  deletePeriod( period_to_delete ) {
    this.selected_periods.forEach((period, period_index) => {
      if ( period_to_delete.id === period.id) {
        this.selected_periods.splice(period_index, 1);
      }
    });
  }

  // Helper method to insert period in new position after drag drop event
  insertPeriod( period_to_insert, current_period, num: number ) {
    this.selected_periods.forEach((period, period_index) => {
      if ( current_period.id === period.id && !this.checkPeriodAvailabilty(period_to_insert, this.selected_periods) ) {
        this.selected_periods.splice(period_index + num, 0 , period_to_insert);
      }
    });
  }

  // setting the period to next or previous
  setPeriod(type) {
    const periods = [];
    if (type === 'down') {
      _.forEach(this.selected_periods, (period) => {
          const periodType = this.deducePeriodType(period.id);
          if (periodType.indexOf('Relative') === -1 ) {
            const lastPer = this.getLastPeriod(period.id, periodType);
            periods.push(this.getPeriodById(lastPer, this.getPeriodArray(periodType, lastPer.substring(0, 4))));
          }
        });
    }
    if (type === 'up') {
      _.forEach(this.selected_periods, (period) => {
        const periodType = this.deducePeriodType(period.id);
        if (periodType.indexOf('Relative') === -1 ) {
          const nextPer = this.getNextPeriod(period.id, periodType);
          periods.push(this.getPeriodById(nextPer, this.getPeriodArray(periodType, nextPer.substring(0, 4))));
        }
        });
    }
    this.selected_periods = periods;
    this.emitPeriod(false);
    setTimeout(() => {
      this.emitPeriod(true);
    }, 50);
  }

  // check if period already exist in the period display list
  getPeriodById(period_id, array): boolean {
    let checker: any;
    for ( const per of array ){
      if ( per.id === period_id) {
        checker = per;
      }
    }
    return checker;
  }

  pushPeriodForward() {
    this.year += 1;
    this.periods = this.getPeriodArray(this.period_type, this.year);
    this.onYearUpdate.emit(this.year);
  }

  pushPeriodBackward() {
    this.year -= 1;
    this.periods = this.getPeriodArray(this.period_type, this.year);
    this.onYearUpdate.emit(this.year);
  }

  changePeriodType() {
    this.periods = this.getPeriodArray(this.period_type, this.year);
    this.onTypeUpdate.emit(this.period_type);
  }

  getSelectedItemsToRemove() {
    let count = 0;
    this.selected_periods.forEach(period => {
      if (_.includes(_.map(this.periods, 'id' ), period.id)) {
        count++;
      }
    });
    return count;

  }
  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivatePer ( $event ) {
    const index = this.selected_periods.indexOf($event);
    this.selected_periods = [...this.selected_periods.slice(0, index), ...this.selected_periods.slice(index + 1)];
    this.emitPeriod(false);
  }

  // add item to array of selected items when item is selected
  activatePer($event) {
    if (!this.checkPeriodAvailabilty($event, this.selected_periods)) {
      this.selected_periods = [...this.selected_periods, $event];
      this.emitPeriod(false);
    }
  }

  emitPeriod(showUpdate: boolean) {
    if (showUpdate) {
      this.onPeriodUpdate.emit({
        items: this.selected_periods,
        type: this.period_type,
        starting_year: this.year,
        name: 'pe',
        value: this.getPeriodsForAnalytics(this.selected_periods)
      });
    }else {
      this.onPeriodChange.emit({
        items: this.selected_periods,
        type: this.period_type,
        starting_year: this.year,
        name: 'pe',
        value: this.getPeriodsForAnalytics(this.selected_periods)
      });
    }

  }


  getPeriodsForAnalytics(selectedPeriod) {
    let periodForAnalytics = '';
    selectedPeriod.forEach((periodValue, periodIndex) => {
      periodForAnalytics += periodIndex === 0 ? periodValue.id : ';' + periodValue.id;
    });
    return periodForAnalytics;
  }

  // check if orgunit already exist in the orgunit display list
  checkPeriodAvailabilty(period, array): boolean {
    let checker = false;
    for ( const per of array ) {
      if ( per.id === period.id) {
        checker = true;
      }
    }
    return checker;
  }


  getPeriodArray(type, year) {
    const date = new Date();
    const this_year = date.getFullYear();
    const last_year = this_year - 1;
    const periods = [];
    if (type === 'Weekly') {
      periods.push({id: '', name: ''});
    }else if (type === 'Monthly') {
      periods.push({id: year + '12', name: 'December ' + year}, {id: year + '11', name: 'November ' + year}, {id: year + '10', name: 'October ' + year}, {id: year + '09', name: 'September ' + year}, {id: year + '08', name: 'August ' + year}, {id: year + '07', name: 'July ' + year}, {id: year + '06', name: 'June ' + year}, {id: year + '05', name: 'May ' + year}, {id: year + '04', name: 'April ' + year}, {id: year + '03', name: 'March ' + year}, {id: year + '02', name: 'February ' + year}, {id: year + '01', name: 'January ' + year, selected: true});
    }else if (type === 'BiMonthly') {
      periods.push({id: year + '01B', name: 'January - February ' + year, selected: true}, {id: year + '02B', name: 'March - April ' + year}, {id: year + '03B', name: 'May - June ' + year}, {id: year + '04B', name: 'July - August ' + year}, {id: year + '05B', name: 'September - October ' + year}, {id: year + '06B', name: 'November - December ' + year});
    }else if (type === 'Quarterly') {
      periods.push({id: year + 'Q4', name: 'October - December ' + year}, {id: year + 'Q3', name: 'July - September ' + year}, {id: year + 'Q2', name: 'April - June ' + year}, {id: year + 'Q1', name: 'January - March ' + year, selected: true});
    }else if (type === 'SixMonthly') {
      periods.push({id: year + 'S1', name: 'January - June ' + year, selected: true}, {id: year + 'S2', name: 'July - December ' + year});
    }else if (type === 'SixMonthlyApril') {
      const useYear = parseInt(year) + 1;
      periods.push({id: year + 'AprilS2', name: 'October ' + year + ' - March ' + useYear, selected: true}, {id: year + 'AprilS1', name: 'April - September ' + year});
    }else if (type === 'FinancialOct') {
      for (let i = 0; i <= 10; i++) {
        const useYear = parseInt(year) - i;
        const currentYear = useYear + 1;
        periods.push({id: useYear + 'Oct', name: 'October ' + useYear + ' - September ' + currentYear});
      }
    }else if (type === 'Yearly') {
      for (let i = 0; i <= 10; i++) {
        const useYear = parseInt(year) - i;
        periods.push({id: useYear, name: useYear});

      }
    }else if (type === 'FinancialJuly') {
      for (let i = 0; i <= 10; i++) {
        const useYear = parseInt(year) - i;
        const currentYear = useYear + 1;
        periods.push({id: useYear + 'July', name: 'July ' + useYear + ' - June ' + currentYear});
      }
    }else if (type === 'FinancialApril') {
      for (let i = 0; i <= 10; i++) {
        const useYear = parseInt(year) - i;
        const currentYear = useYear + 1;
        periods.push({ id: useYear + 'April', name: 'April ' + useYear + ' - March ' + currentYear });
      }
    }else if (type === 'Relative Weeks') {
      periods.push({id: 'THIS_WEEK', name: 'This Week'}, {id: 'LAST_WEEK', name: 'Last Week'}, {id: 'LAST_4_WEEK', name: 'Last 4 Weeks', selected: true}, {id: 'LAST_12_WEEK', name: 'last 12 Weeks'}, {id: 'LAST_52_WEEK', name: 'Last 52 weeks'});
    }else if (type === 'RelativeMonth') {
      periods.push(
        {id: 'THIS_MONTH', name: 'This Month'},
        {id: 'LAST_MONTH', name: 'Last Month'},
        {id: 'LAST_3_MONTHS', name: 'Last 3 Months'},
        {id: 'LAST_6_MONTHS', name: 'Last 6 Months'},
        {id: 'LAST_12_MONTHS', name: 'Last 12 Months', selected: true},
        {id: this_year + '01;' + this_year + '02;' + this_year + '03;' + this_year + '04;' + this_year + '05;' + this_year + '06;' + this_year + '07;' + this_year + '08;' + this_year + '09;' + this_year + '10;' + this_year + '11;' + this_year + '12', name: 'Month This Year'},
        {id: last_year + '01;' + last_year + '02;' + last_year + '03;' + last_year + '04;' + last_year + '05;' + last_year + '06;' + last_year + '07;' + last_year + '08;' + last_year + '09;' + last_year + '10;' + last_year + '11;' + last_year + '12', name: 'Month Last Year'}

      );
    }else if (type === 'RelativeBiMonth') {
      periods.push({id: 'THIS_BIMONTH', name: 'This Bi-month'}, {id: 'LAST_BIMONTH', name: 'Last Bi-month'}, {id: 'LAST_6_BIMONTHS', name: 'Last 6 Bi-Month', selected: true});
    }else if (type === 'RelativeQuarter') {
      periods.push(
        {id: 'THIS_QUARTER', name: 'This Quarter'},
        {id: 'LAST_QUARTER', name: 'Last Quarter'},
        {id: 'LAST_4_QUARTERS', name: 'Last 4 Quarters', selected: true},
        {id: this_year + 'Q1;' + this_year + 'Q2;' + this_year + 'Q3;' + this_year + 'Q4', name: 'Quarters This Year'},
        {id: last_year + 'Q1;' + last_year + 'Q2;' + last_year + 'Q3;' + last_year + 'Q4', name: 'Quarters Last Year'}
        );
    }else if (type === 'RelativeSixMonthly') {
      periods.push({id: 'THIS_SIX_MONTH', name: 'This Six-month'}, {id: 'LAST_SIX_MONTH', name: 'Last Six-month'}, {id: 'LAST_2_SIXMONTHS', name: 'Last 2 Six-month', selected: true});
    }else if (type === 'RelativeFinancialYear') {
      periods.push({id: 'THIS_FINANCIAL_YEAR', name: 'This Financial Year'}, {id: 'LAST_FINANCIAL_YEAR', name: 'Last Financial Year', selected: true}, {id: 'LAST_5_FINANCIAL_YEARS', name: 'Last 5 Financial Years'});
    }else if (type === 'RelativeYear') {
      periods.push({id: 'THIS_YEAR', name: 'This Year'}, {id: 'LAST_YEAR', name: 'Last Year', selected: true}, {id: 'LAST_5_YEARS', name: 'Last 5 Five Years'});
    }
    return periods;
  }

  getFinencialPeriodArray(type, year) {
    const periods = [];
    const last_yaer = parseInt(year) - 1;
    if (type === 'Monthly') {
      periods.push(
        {id: last_yaer + '07', name: 'July ' + last_yaer},
        {id: last_yaer + '08', name: 'August ' + last_yaer},
        {id: last_yaer + '09', name: 'September ' + last_yaer},
        {id: last_yaer + '10', name: 'October ' + last_yaer},
        {id: last_yaer + '11', name: 'November ' + last_yaer},
        {id: last_yaer + '12', name: 'December ' + last_yaer},
        {id: year + '01', name: 'January ' + year, selected: true},
        {id: year + '02', name: 'February ' + year},
        {id: year + '03', name: 'March ' + year},
        {id: year + '04', name: 'April ' + year},
        {id: year + '05', name: 'May ' + year},
        {id: year + '06', name: 'June ' + year}
        );
    }else if (type === 'Quarterly') {
      periods.push(
        {id: last_yaer + 'Q3', name: 'July - September ' + last_yaer},
        {id: last_yaer + 'Q4', name: 'October - December ' + last_yaer},
        {id: year + 'Q1', name: 'January - March ' + year, selected: true},
        {id: year + 'Q2', name: 'April - June ' + year}
        );
    }else if (type === 'FinancialJuly') {
      for (let i = 0; i <= 10; i++) {
        const useYear = parseInt(year) - i;
        const currentYear = useYear + 1;
        periods.push({id: useYear + 'July', name: 'July ' + useYear + ' - June ' + currentYear});
      }
    }else if (type === 'RelativeMonth') {
      periods.push({id:   'THIS_MONTH', name: 'This Month'}, {id:  'LAST_MONTH', name: 'Last Month'}, {id:  'LAST_3_MONTHS', name: 'Last 3 Months'}, {id: 'LAST_6_MONTHS', name: 'Last 6 Months'}, {id: 'LAST_12_MONTHS', name: 'Last 12 Months', selected: true});
    }else if (type === 'RelativeQuarter') {
      periods.push({id:  'THIS_QUARTER', name: 'This Quarter'}, {id: 'LAST_QUARTER', name: 'Last Quarter'}, {id: 'LAST_4_QUARTERS', name: 'Last 4 Quarters', selected: true});
    }else if (type === 'RelativeFinancialYear') {
      periods.push({id:  'THIS_FINANCIAL_YEAR', name: 'This Financial Year'}, {id: 'LAST_FINANCIAL_YEAR', name: 'Last Financial Year', selected: true}, {id: 'LAST_5_FINANCIAL_YEARS', name: 'Last 5 Financial Years'});
    }else if (type === 'RelativeYear') {
      periods.push({id:  'THIS_YEAR', name: 'This Year'}, {id: 'LAST_YEAR', name: 'Last Year', selected: true}, {id: 'LAST_5_YEARS', name: 'Last 5 Five Years'});
    }
    return periods;
  }
  getLastPeriod(period: any, period_type: string = 'Quarterly' ): any {
    if (period_type === 'Weekly') {

    }else if (period_type === 'Monthly') {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      let time = '';
      if (month === '02') {
        time = year + '01';
      }else if (month === '03') {
        time = year + '02';
      }else if (month === '04') {
        time = year + '03';
      }else if (month === '05') {
        time = year + '04';
      }else if (month === '06') {
        time = year + '05';
      }else if (month === '07') {
        time = year + '06';
      }else if (month === '08') {
        time = year + '07';
      }else if (month === '09') {
        time = year + '08';
      }else if (month === '10') {
        time = year + '09';
      }else if (month === '11') {
        time = year + '10';
      }else if (month === '12') {
        time = year + '11';
      }else if (month === '01') {
        const yr = parseInt(year) - 1;
        time = yr + '12';
      }
      return time;
    }else if (period_type === 'BiMonthly') {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      let time = '';
      if (month === '02') {
        time = year + '01B';
      }else if (month === '03') {
        time = year + '02B';
      }else if (month === '04') {
        time = year + '03B';
      }else if (month === '05') {
        time = year + '04B';
      }else if (month === '06') {
        time = year + '05B';
      }else if (month === '01') {
        const yr = parseInt(year) - 1;
        time = yr + '06B';
      }
      return time;
    }else if (period_type === 'Quarterly') {
      const year = period.substring(0, 4);
      const quater = period.substring(4, 6);
      let time = '';
      if (quater === 'Q4') {
        time = year + 'Q3';
      }else if (quater === 'Q3') {
        time = year + 'Q2';
      }else if (quater === 'Q2') {
        time = year + 'Q1';
      }else if (quater === 'Q1') {
        const yr = parseInt(year) - 1;
        time = yr + 'Q4';
      }
      return time;
    }else if (period_type === 'SixMonthly') {
      const year = period.substring(0, 4);
      const six_month = period.substring(4, 6);
      let time = '';
      if (six_month === 'S1') {
        const yr = parseInt(year) - 1;
        time = yr + 'S2';
      }else if (six_month === 'S2') {
        time = year + 'S1';
      }
      return time;
    }else if (period_type === 'SixMonthlyApril') {
      const year = period.substring(0, 4);
      const six_month = period.substring(4, 12);
      let time = '';
      if (six_month === 'AprilS2') {
        time = year + 'AprilS1';
      }else if (six_month === 'AprilS1') {
        const yr = parseInt(year) - 1;
        time = yr + 'AprilS2';
      }
      return time;
    }else if (period_type === 'FinancialOct') {
      const year = period.substring(0, 4);
      const last_year = parseInt(year) - 1;
      return last_year + 'Oct';
    }else if (period_type === 'Yearly') {
      return parseInt(period) - 1;
    }else if (period_type === 'FinancialJuly') {
      const year = period.substring(0, 4);
      const last_year = parseInt(year) - 1;
      return last_year + 'July';
    }else if (period_type === 'FinancialApril') {
      const year = period.substring(0, 4);
      const last_year = parseInt(year) - 1;
      return last_year + 'April';
    }else { return period; }


  }

  getNextPeriod(period: any, period_type: string = 'Quarterly'): any {
    if (period_type === 'Weekly') {

    }else if (period_type === 'Monthly') {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      let time = '';
      if (month === '02') {
        time = year + '03';
      }else if (month === '03') {
        time = year + '04';
      }else if (month === '04') {
        time = year + '05';
      }else if (month === '05') {
        time = year + '06';
      }else if (month === '06') {
        time = year + '07';
      }else if (month === '07') {
        time = year + '08';
      }else if (month === '08') {
        time = year + '09';
      }else if (month === '09') {
        time = year + '10';
      }else if (month === '10') {
        time = year + '11';
      }else if (month === '11') {
        time = year + '12';
      }else if (month === '12') {
        const yr = parseInt(year) + 1;
        time = yr + '01';
      }else if (month === '01') {
        time = year + '02';
      }
      return time;
    }else if (period_type === 'BiMonthly') {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      let time = '';
      if (month === '02') {
        time = year + '03B';
      }else if (month === '03') {
        time = year + '04B';
      }else if (month === '04') {
        time = year + '05B';
      }else if (month === '05') {
        time = year + '06B';
      }else if (month === '06') {
        const yr = parseInt(year) + 1;
        time = yr + '01B';
      }else if (month === '01') {
        time = year + '02B';
      }
      return time;
    }else if (period_type === 'Quarterly') {
      const year = period.substring(0, 4);
      const quater = period.substring(4, 6);
      let time = '';
      if (quater === 'Q1') {
        time = year + 'Q2';
      }else if (quater === 'Q3') {
        time = year + 'Q4';
      }else if (quater === 'Q2') {
        time = year + 'Q3';
      }else if (quater === 'Q4') {
        const yr = parseInt(year) + 1;
        time = yr + 'Q1';
      }
      return time;
    }else if (period_type === 'SixMonthly') {
      const year = period.substring(0, 4);
      const six_month = period.substring(4, 6);
      let time = '';
      if (six_month === 'S2') {
        const yr = parseInt(year) + 1;
        time = yr + 'S1';
      }else if (six_month === 'S1') {
        time = year + 'S2';
      }
      return time;
    }else if (period_type === 'SixMonthlyApril') {
      const year = period.substring(0, 4);
      const six_month = period.substring(4, 12);
      let time = '';
      if (six_month === 'AprilS2') {
        const yr = parseInt(year) + 1;
        time = yr + 'AprilS1';
      }else if (six_month === 'AprilS1') {
        time = year + 'AprilS2';
      }
      return time;
    }else if (period_type === 'FinancialOct') {
      const year = period.substring(0, 4);
      const last_year = parseInt(year) + 1;
      return last_year + 'Oct';
    }else if (period_type === 'Yearly') {
      return parseInt(period) + 1;
    }else if (period_type === 'FinancialJuly') {
      const year = period.substring(0, 4);
      const last_year = parseInt(year) + 1;
      return last_year + 'July';
    }else if (period_type === 'FinancialApril') {
      const year = period.substring(0, 4);
      const last_year = parseInt(year) + 1;
      return last_year + 'April';
    }else { return period; }
  }

  deducePeriodType(periodId: string): string {
    let periodType = 'Quarterly';
    if (periodId.length === 4) {
      periodType = 'Yearly';
    }else if ( periodId.length === 6) {
      if ( periodId.indexOf('Q') !== -1 ) {
        periodType = 'Quarterly';
      }else if ( periodId.indexOf('S') !== -1 ) {
        periodType = 'SixMonthly';
      }else {
        periodType = 'Monthly';
      }
    }else if ( periodId.length === 7) {
      if ( periodId.indexOf('B') !== -1 ) {
        periodType = 'BiMonthly';
      }if ( periodId.indexOf('Oct') !== -1 ) {
        periodType = 'FinancialOct';
      }
    }else if ( periodId.length === 9) {
      if ( periodId.indexOf('April') !== -1 ) {
        periodType = 'FinancialApril';
      }if ( periodId.indexOf('_WEEK') !== -1 ) {
        periodType = 'Relative Weeks';
      }
    }else {
      if ( periodId.indexOf('AprilS') !== -1 ) {
        periodType = 'SixMonthlyApril';
      }if ( periodId.indexOf('July') !== -1 ) {
        periodType = 'FinancialJuly';
      }if ( periodId.indexOf('FINANCIAL_') !== -1 ) {
        periodType = 'RelativeFinancialYear';
      }if ( periodId.indexOf('_MONTH') !== -1 ) {
        periodType = 'RelativeMonth';
      }if ( periodId.indexOf('_WEEK') !== -1 ) {
        periodType = 'Relative Weeks';
      }if ( periodId.indexOf('_QUARTERS') !== -1 ) {
        periodType = 'RelativeQuarter';
      }
    }

    return periodType;
  }

}
