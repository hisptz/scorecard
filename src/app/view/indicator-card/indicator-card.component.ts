import {Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {FilterService} from '../../shared/services/filter.service';
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {Constants} from '../../shared/costants';
import {Http, Response} from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Rx';
import {Angular2Csv} from 'angular2-csv';
import {VisualizerService} from '../dhis-visualizer/visulizer.service';
import * as _ from 'lodash';

const actionMapping1: IActionMapping = {
  mouse: {
    click: (node, tree, $event) => {
      $event.ctrlKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event);
    }
  }
};

const actionMapping: IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
  }
};

@Component({
  selector: 'app-indicator-card',
  templateUrl: './indicator-card.component.html',
  styleUrls: ['./indicator-card.component.css']
})
export class IndicatorCardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() orgunit_nodes: any = [];
  @Input() current_year: any;
  @Input() current_period_type: any;
  @Input() indicator: any;
  @Input() functions: any[] = [];
  @Input() default_period: any;
  @Input() default_period_type: any;
  @Input() default_orgunit: any;
  @Input() hidden_columns: any = [];
  @Input() default_orgunit_model: any = {};
  @Output() show_details = new EventEmitter<any>();
  card_orgunit_tree_config: any = {
    show_search: true,
    search_text: 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: 'Select Organisation Unit'
  };

  card_period_tree_config: any = {
    show_search: true,
    search_text: 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: true,
    placeholder: 'Select period'
  };
  card_organisationunits: any[] = [];
  card_periods: any[] = [];
  card_selected_orgunits: any[] = [];
  card_selected_periods: any[] = [];
  card_period_type: string = 'Quarterly';
  card_year: any;
  showOrgTree: boolean = true;
  showPerTree: boolean = true;

  card_orgUnit: any;
  card_period: any;
  current_visualisation: string = 'table';
  current_analytics_data: any = null;
  current_parameters: string[] = [];

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('pertree')
  pertree: TreeComponent;

  private subscription: Subscription;

  loading: boolean = true;

  chartData: any = {};
  tableData: any = {};
  visualizer_config: any = {
    'type': 'table',
    'tableConfiguration': {
      'title': 'My chart',
      'rows': ['ou', 'dx'],
      'columns': ['pe']
    },
    'chartConfiguration': {
      'type': 'line',
      'show_labels': false,
      'title': 'My chart',
      'xAxisType': 'pe',
      'yAxisType': 'dx'
    }
  };
  show_labels: boolean = false;

  icons: any[] = [
    {name: 'table', image: 'table.jpg'},
    {name: 'column', image: 'bar.png'},
    {name: 'line', image: 'line.png'},
    {name: 'combined', image: 'combined.jpg'},
    {name: 'bar', image: 'column.png'},
    {name: 'area', image: 'area.jpg'},
    {name: 'pie', image: 'pie.png'},
    {name: 'radar', image: 'radar.png'},
    {name: 'stacked_column', image: 'column-stacked.png'},
    {name: 'stacked_bar', image: 'bar-stacked.png'},
    {name: 'gauge', image: 'gauge.jpg'}
  ];

  chart_settings: string = 'ou-pe';
  showBottleneck: boolean = false;
  error_occured: boolean = false;

  orgunit_model: any = {
    selection_mode: 'orgUnit',
    selected_level: '',
    selected_group: '',
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    selected_user_orgunit: 'USER_ORGUNIT'
  };

  bottleneck_first_time: boolean = false;

  // custom settings for tree
  customTemplateStringOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

  // custom settings for tree
  customTemplateStringOrgunitOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

  details_indicators: string = '';
  constructor(private filterService: FilterService,
              private visulizationService: VisualizerService,
              private constant: Constants,
              private http: Http) {

  }

  ngOnInit() {
    this.card_organisationunits = this.orgunit_nodes;
    this.card_period_type = this.current_period_type;
    this.card_year = this.current_year;
    if (this.default_orgunit.hasOwnProperty('orgunit_groups')) {
      this.orgunit_model = this.default_orgunit;
    } else {
      this.orgunit_model.orgunit_groups = this.default_orgunit_model.orgunit_groups;
      this.orgunit_model.orgunit_levels = this.default_orgunit_model.orgunit_levels;
      this.orgunit_model.user_orgunits = this.default_orgunit_model.user_orgunits;
      this.orgunit_model.selected_orgunits = [this.default_orgunit];
    }
    this.card_periods = this.filterService.getPeriodArray(this.default_period_type, this.card_year);
    this.card_selected_periods = [...this.default_period];

  }

  ngAfterViewInit() {
    console.log(this.default_orgunit);

    this.updateIndicatorCard(this.indicator, 'table', this.default_period, this.orgunit_model, false);
    // this.default_period.forEach((current_period) => {
    //   this.activateNode(current_period.id, this.pertree);
    // });
    // activate organisation units
    for (const active_orgunit of this.orgunit_model.selected_orgunits) {
      this.activateNode(active_orgunit.id, this.orgtree);
    }
  }

  switchBottleneck(indicator) {
    if (this.showBottleneck) {
      this.bottleneck_first_time = true;
      this.updateIndicatorCard(indicator, this.current_visualisation, this.card_selected_periods, this.orgunit_model);
    } else {
      this.updateIndicatorCard(indicator, this.current_visualisation, this.card_selected_periods, this.orgunit_model);
    }
  }

  // a call that will change the view type
  updateIndicatorCard(holders: any[], type: string, periods: any[], orgunits: {}, with_children: boolean = false, show_labels: boolean = false) {
    const analytics_calls = [];
    // cancel the current call if still in progress when switching between charts
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.loading = true;
    this.chartData = {};
    this.current_visualisation = (type !== 'csv') ? type : this.current_visualisation;
    // make sure that orgunit and period selections are closed
    this.showOrgTree = true;
    this.showPerTree = true;
    // construct metadata array
    const indicatorsArray = [];
    const function_indicatorsArray = [];
    const orgUnitsArray = [];
    const periodArray = [];

    // check first if your supposed to load bottleneck indicators too for analysis
    let labels = null;
    if (this.showBottleneck) {
      labels = [];
      for (const holder of holders) {
        for (const item of holder.indicators) {
          if (this.hidden_columns.indexOf(item.id) === -1) {
            if (item.hasOwnProperty('bottleneck_indicators')) {
              for (const bottleneck of item.bottleneck_indicators) {
                if (bottleneck.hasOwnProperty('function')) {
                  function_indicatorsArray.push(bottleneck);
                  labels.push({'id': bottleneck.id, 'name': bottleneck.bottleneck_title});
                }else {
                  indicatorsArray.push(bottleneck.id);
                  labels.push({'id': bottleneck.id, 'name': bottleneck.bottleneck_title});
                }
              }
              console.log('Using functions', function_indicatorsArray);
            }
            // indicatorsArray.push(item.id);
            // labels.push({'id': item.id, 'name': item.title})
          }
        }
      }
      if (this.bottleneck_first_time) {
        type = 'column';
        this.current_visualisation = 'column';
        this.chart_settings = 'ou-dx';
        this.visualizer_config.type = 'chart';
        this.bottleneck_first_time = false;
      }
    } else {
      labels = [];
      for (const holder of holders) {
        for (const item of holder.indicators) {
          if (this.hidden_columns.indexOf(item.id) === -1) {
            indicatorsArray.push(item.id);
            labels.push({'id': item.id, 'name': item.title});
          }
        }
      }
    }

    const config_array = this.chart_settings.split('-');
    if (type === 'table') {
      this.visualizer_config = {
        'type': 'table',
        'tableConfiguration': {
          'title': this.prepareCardTitle(this.indicator),
          'rows': ['ou'],
          'columns': ['dx', 'pe'],
          'labels': labels
        },
        'chartConfiguration': {
          'type': type,
          'show_labels': show_labels,
          'title': this.prepareCardTitle(this.indicator),
          'xAxisType': 'pe',
          'yAxisType': 'ou',
          'labels': labels
        }
      };
    }else if (type === 'csv') {

    } else if (type === 'info') {
      this.details_indicators = indicatorsArray.join(';');
      this.visualizer_config.type = 'info';

    }else {
      this.visualizer_config = {
        'type': 'chart',
        'tableConfiguration': {
          'title': this.prepareCardTitle(this.indicator),
          'rows': ['ou'],
          'columns': ['pe'],
          'labels': labels
        },
        'chartConfiguration': {
          'type': type,
          'show_labels': show_labels,
          'title': this.prepareCardTitle(this.indicator),
          'xAxisType': config_array[1],
          'yAxisType': config_array[0],
          'labels': labels
        }
      };
    }
    // if there is no change of parameters from last request dont go to server
    if (type === 'info') {

      this.loading = false;
    } else {
      if (this.checkIfParametersChanged(orgunits, periods, indicatorsArray, function_indicatorsArray)) {
        this.error_occured = false;
        this.loading = false;
        if (type === 'csv') {
          this.downloadCSV(this.current_analytics_data);
        } else {
          this.chartData = this.visulizationService.drawChart(this.current_analytics_data, this.visualizer_config.chartConfiguration);
          this.tableData = this.visulizationService.drawTable(this.current_analytics_data, this.visualizer_config.tableConfiguration);
        }
      }else {
        this.current_parameters = [];
        for (const item of periods) {
          periodArray.push(item.id);
          this.current_parameters.push(item.id);
        }
        // create an api analytics call
        if (indicatorsArray.length === labels.length ) {
          const url = this.constant.root_api + 'analytics.json?dimension=dx:' + indicatorsArray.join(';') + '&dimension=ou:' + this.getOrgUnitsForAnalytics(orgunits, with_children) + '&dimension=pe:' + periodArray.join(';') + '&displayProperty=NAME';
          this.subscription = this.loadAnalytics(url).subscribe(
            (data) => {
              this.current_analytics_data = data;
              this.loading = false;
              if (type === 'csv') {
                this.downloadCSV(data);
              } else {
                this.chartData = this.visulizationService.drawChart(data, this.visualizer_config.chartConfiguration);
                this.tableData = this.visulizationService.drawTable(data, this.visualizer_config.tableConfiguration);
              }
              this.error_occured = false;
            },
            error => {
              this.error_occured = true;
              console.log(error);
            }
          );
        }else {
          console.warn('You can imagine we are here we need to use functions now');
          if (indicatorsArray.length !== 0) {
            let completed_functions = 0;
            const url = this.constant.root_api + 'analytics.json?dimension=dx:' + indicatorsArray.join(';') + '&dimension=pe:' + periodArray.join(';') + '&dimension=ou:' + this.getOrgUnitsForAnalytics(orgunits, with_children) + '&displayProperty=NAME';
            this.subscription = this.loadAnalytics(url).subscribe(
              (data) => {
                analytics_calls.push(data);
                if (function_indicatorsArray.length !== 0) {
                  function_indicatorsArray.forEach( (indicator_item) => {
                    const use_function = this.getFunction(indicator_item.function);
                    const parameters = {
                      dx: indicator_item.id,
                      ou: this.getOrgUnitsForAnalytics(orgunits, with_children),
                      pe: periodArray.join(';'),
                      rule: this.getFunctionRule(use_function['rules'], indicator_item.id),
                      success: (function_data) => {
                        completed_functions++;
                        analytics_calls.push(function_data);
                        if (completed_functions === function_indicatorsArray.length ) {
                          this.current_analytics_data = this.mergeAnalyticsCalls(analytics_calls, labels);
                          this.loading = false;
                          if (type === 'csv') {
                            this.downloadCSV(data);
                          } else {
                            this.chartData = this.visulizationService.drawChart(this.current_analytics_data, this.visualizer_config.chartConfiguration);
                            this.tableData = this.visulizationService.drawTable(this.current_analytics_data, this.visualizer_config.tableConfiguration);
                          }
                          this.error_occured = false;
                        }
                      },
                      error: (error) => {
                        completed_functions++;
                        this.error_occured = true;
                        console.log('error');
                      },
                      progress: (progress) => {
                        console.log('progress');
                      }
                    };
                    const execute = Function('parameters', use_function['function']);
                    execute(parameters);
                  });
                }

              },
              error => {
                this.error_occured = true;
                console.log(error);
              }
            );
          }else {
            if (function_indicatorsArray.length !== 0) {
              let completed_functions = 0;
              function_indicatorsArray.forEach( (indicator_item) => {
                const use_function = this.getFunction(indicator_item.function);
                const parameters = {
                  dx: indicator_item.id,
                  ou: this.getOrgUnitsForAnalytics(orgunits, with_children),
                  pe: periodArray.join(';'),
                  rule: this.getFunctionRule(use_function['rules'], indicator_item.id),
                  success: (function_data) => {
                    completed_functions++;
                    analytics_calls.push(function_data);
                    if (completed_functions === function_indicatorsArray.length ) {
                      this.current_analytics_data = this.mergeAnalyticsCalls(analytics_calls, labels);
                      this.loading = false;
                      if (type === 'csv') {
                        // this.downloadCSV(data);
                      } else {
                        this.chartData = this.visulizationService.drawChart(this.current_analytics_data, this.visualizer_config.chartConfiguration);
                        this.tableData = this.visulizationService.drawTable(this.current_analytics_data, this.visualizer_config.tableConfiguration);
                      }
                      this.error_occured = false;
                    }
                  },
                  error: (error) => {
                    completed_functions++;
                    this.error_occured = true;
                    console.log('error');
                  },
                  progress: (progress) => {
                    console.log('progress');
                  }
                };
                const execute = Function('parameters', use_function['function']);
                execute(parameters);
              });
            }
          }
        }
      }
    }
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
  // Merge analytics calls before displaying them
  // merge analytics calls
  mergeAnalyticsCalls( analytics: any[], itemList: any ) {
    const combined_analytics: any = {
      headers: [],
      metaData: {
        names: {},
        dx: [],
        pe: [],
        ou: [],
        co: []
      },
      rows: [],
      width: 0,
      height: 0
    };

    analytics.forEach( (analytic) => {
      combined_analytics.headers = analytic.headers;
      const namesArray = this._getArrayFromObject(analytic.metaData.names);
      namesArray.forEach((name) => {
        if (!combined_analytics.metaData.names[name.id]) {
          combined_analytics.metaData.names[name.id] =  name.value;
        }
      });
      analytic.metaData.dx.forEach((val) => {
        if (!_.includes(combined_analytics.metaData.dx, val)) {
          combined_analytics.metaData.dx.push( val );
        }
      });
      analytic.metaData.ou.forEach((val) => {
        if (!_.includes(combined_analytics.metaData.ou, val)) {
          combined_analytics.metaData.ou.push( val );
        }
      });
      analytic.metaData.pe.forEach((val) => {
        if (!_.includes(combined_analytics.metaData.pe, val)) {
          combined_analytics.metaData.pe.push( val );
        }
      });
      const newDxOrder = [];
      itemList.forEach((listItem) => {
          newDxOrder.push(listItem.id);
      });
      combined_analytics.metaData.dx = newDxOrder;
      analytic.rows.forEach( (row) => {
        combined_analytics.rows.push(row);
      });
    });

    return combined_analytics;

  }

  private _getArrayFromObject(object) {
    return _.map(object, function(value, prop) {
      return { id: prop, value: value };
    });
  }


  checkIfParametersChanged(orgunits, periods, indicators, function_indicatorsArray): boolean {
    let checker = false;
    const temp_arr = [];
    for (const per of periods) {
      temp_arr.push(per.id);
    }
    for (const org of orgunits) {
      temp_arr.push(org.id);
    }
    for (const indicator of indicators) {
      temp_arr.push(indicator);
    }
    for (const indicator of function_indicatorsArray) {
      temp_arr.push(indicator.id);
    }
    if (this.current_parameters.length !== 0 && temp_arr.length === this.current_parameters.length) {
      checker = temp_arr.sort().join(',') === this.current_parameters.sort().join(',');
    } else {
      checker = false;
    }
    return checker;
  }

  // a function to reverse the content of X axis and Y axis
  switchXandY(type, show_labels: boolean = false) {
    if (type === 'table') {
      if (this.visualizer_config.tableConfiguration.rows[0] === 'ou') {
        this.visualizer_config = {
          'type': 'table',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['pe'],
            'columns': ['dx', 'ou']
          },
          'chartConfiguration': {
            'type': type,
            'show_labels': show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': 'ou',
            'yAxisType': 'pe'
          }
        };
      } else if (this.visualizer_config.tableConfiguration.rows[0] === 'pe') {
        this.visualizer_config = {
          'type': 'table',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['ou'],
            'columns': ['dx', 'pe']
          },
          'chartConfiguration': {
            'type': type,
            'show_labels': show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': 'pe',
            'yAxisType': 'ou'
          }
        };
      }

    } else if (type === 'csv') {

    } else if (type === 'info') {
    } else {
      const config_array = this.chart_settings.split('-');
      if (this.visualizer_config.chartConfiguration.xAxisType === config_array[0]) {
        this.visualizer_config = {
          'type': 'chart',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['pe'],
            'columns': ['dx', 'ou']
          },
          'chartConfiguration': {
            'type': type,
            'show_labels': show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': config_array[1],
            'yAxisType': config_array[0]
          }
        };
      } else if (this.visualizer_config.chartConfiguration.xAxisType === config_array[1]) {
        this.visualizer_config = {
          'type': 'chart',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['ou'],
            'columns': ['dx', 'pe']
          },
          'chartConfiguration': {
            'type': type,
            'show_labels': show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': config_array[0],
            'yAxisType': config_array[1]
          }
        };
      }
    }
    this.chartData = this.visulizationService.drawChart(this.current_analytics_data, this.visualizer_config.chartConfiguration);
    this.tableData = this.visulizationService.drawTable(this.current_analytics_data, this.visualizer_config.tableConfiguration);

  }

  // adding one year to the list of period
  pushPeriodForward() {
    this.card_year += 1;
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type, this.card_year);
  }

  // minus one year to the list of period
  pushPeriodBackward() {
    this.card_year -= 1;
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type, this.card_year);
  }

  // react to period changes
  changePeriodType() {
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type, this.card_year);
  }

  // display Orgunit Tree
  displayOrgTree() {
    this.showOrgTree = !this.showOrgTree;
  }

  // display period Tree
  displayPerTree() {
    this.showPerTree = !this.showPerTree;
  }

  // prepare a proper name for updating the organisation unit display area.
  getProperPreOrgunitName(): string {
    let name = '';
    if (this.orgunit_model.selection_mode === 'Group') {
      const use_value = this.orgunit_model.selected_group.split('-');
      for (const single_group of this.orgunit_model.orgunit_groups) {
        if (single_group.id === use_value[1]) {
          name = single_group.name + ' in';
        }
      }
    } else if (this.orgunit_model.selection_mode === 'Usr_orgUnit') {
      if (this.orgunit_model.selected_user_orgunit === 'USER_ORGUNIT') { name = 'User org unit '; }
      if (this.orgunit_model.selected_user_orgunit === 'USER_ORGUNIT_CHILDREN') { name = 'User sub-units'; }
      if (this.orgunit_model.selected_user_orgunit === 'USER_ORGUNIT_GRANDCHILDREN') { name = 'User sub-x2-units'; }
    } else if (this.orgunit_model.selection_mode === 'Level') {
      const use_level = this.orgunit_model.selected_level.split('-');
      for (const single_level of this.orgunit_model.orgunit_levels) {
        if (single_level.level === use_level[1]) {
          name = single_level.name + ' in';
        }
      }
    } else {
      name = '';
    }
    return name;
  }

  // a function to prepare a list of organisation units for analytics
  getOrgUnitsForAnalytics(orgunit_model: any, with_children: boolean): string {
    const orgUnits = [];
    let organisation_unit_analytics_string = '';
    // if the selected orgunit is user org unit
    if (orgunit_model.selection_mode === 'Usr_orgUnit') {
      if (orgunit_model.user_orgunits.length === 1) {
        const user_orgunit = this.orgtree.treeModel.getNodeById(orgunit_model.user_orgunits[0]);
        orgUnits.push(user_orgunit.id);
        if (user_orgunit.hasOwnProperty('children')) {
          for (const orgunit of user_orgunit.children) {
            orgUnits.push(orgunit.id);
          }
        }
      } else {
        organisation_unit_analytics_string += orgunit_model.selected_user_orgunit;
      }
    } else {
      // if there is only one organisation unit selected
      if (orgunit_model.selected_orgunits.length === 1) {
        const detailed_orgunit = this.orgtree.treeModel.getNodeById(orgunit_model.selected_orgunits[0].id);
        orgUnits.push(detailed_orgunit.id);
        if (detailed_orgunit.hasOwnProperty('children') && with_children) {
          for (const orgunit of detailed_orgunit.children) {
            this.activateNode(orgunit.id, this.orgtree);
            orgUnits.push(orgunit.id);
          }
        }

      } else { // If there is more than one organisation unit selected
        orgunit_model.selected_orgunits.forEach((orgunit) => {
          orgUnits.push(orgunit.id);
        });
      }
      if (orgunit_model.selection_mode === 'orgUnit') {

      }
      if (orgunit_model.selection_mode === 'Level') {
        organisation_unit_analytics_string += orgunit_model.selected_level + ';';
      }
      if (orgunit_model.selection_mode === 'Group') {
        organisation_unit_analytics_string += orgunit_model.selected_group + ';';
      }
    }


    return organisation_unit_analytics_string + orgUnits.join(';');
  }


// action to be called when a tree item is deselected(Remove item in array of selected items
  deactivateOrg($event) {
    this.orgunit_model.selected_orgunits.forEach((item, index) => {
      if ($event.node.data.id === item.id) {
        this.orgunit_model.selected_orgunits.splice(index, 1);
      }
    });
  };

  // add item to array of selected items when item is selected
  activateOrg = ($event) => {
    if (!this.checkItemAvailabilty($event.node.data, this.orgunit_model.selected_orgunits)) {
      this.orgunit_model.selected_orgunits.push($event.node.data);
    }
  }


  // check if orgunit already exist in the orgunit display list
  checkItemAvailabilty(orgunit, array): boolean {
    let checker = false;
    array.forEach((value) => {
      if (value.id === orgunit.id) {
        checker = true;
      }
    });
    return checker;
  }


  getSelectedItemsToRemove() {
    let count = 0;
    this.card_selected_periods.forEach(period => {
      if (_.includes(_.map(this.card_periods, 'id'), period.id)) {
        count++;
      }
    });
    return count;

  }

  // transfer all period to selected section
  selectAllItems() {
    this.card_periods.forEach((item) => {
      if (!this.checkPeriodAvailabilty(item, this.card_selected_periods)) {
        this.card_selected_periods.push(item);
      }
    });
  }

  deselectAllItems() {
    this.card_selected_periods = [];
  }

  // check if orgunit already exist in the orgunit display list
  checkPeriodAvailabilty(period, array): boolean {
    let checker = false;
    for (const per of array) {
      if (per.id === period.id) {
        checker = true;
      }
    }
    return checker;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivatePer($event) {
    this.card_selected_periods.splice(this.card_selected_periods.indexOf($event), 1);
  }

  // add item to array of selected items when item is selected
  activatePer($event) {
    if (!this.checkPeriodAvailabilty($event, this.card_selected_periods)) {
      this.card_selected_periods.push($event);
    }
  }


  activateNode(nodeId: any, nodes) {
    setTimeout(() => {
      const node = nodes.treeModel.getNodeById(nodeId);
      if (node) {
      // node.toggleActivated();
        node.setIsActive(true, true);
      }
    }, 0);
  }

  // a method to activate the model
  deActivateNode(nodeId: any, nodes, event) {
    setTimeout(() => {
      const node = nodes.treeModel.getNodeById(nodeId);
      if (node) {
        node.setIsActive(false, true);
      }
    }, 0);
    if (event !== null) {
      event.stopPropagation();
    }
  }

  // function that is used to filter nodes
  filterNodes(text, tree, type: string = null) {
    if (type === 'orgunit') {
      if (text.length >= 3) {
        tree.treeModel.filterNodes(text, true);
      } else if (text.length === 0) {
        tree.treeModel.filterNodes('', false);
      }
    } else {
      tree.treeModel.filterNodes(text, true);
    }
  }


  // a function to simplify loading of analytics data
  loadAnalytics(url) {
    return this.http.get(url)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  // hide the model
  removeModel() {
    this.show_details.emit(false);
  }

  // prepare scorecard data and download them as csv
  downloadCSV(analytics_data) {
    let data = [];
    const some_config = {
      'type': 'chart',
      'tableConfiguration': {
        'title': this.prepareCardTitle(this.indicator),
        'rows': ['ou', 'dx'],
        'columns': ['pe']
      },
      'chartConfiguration': {
        'type': 'bar',
        'title': this.prepareCardTitle(this.indicator),
        'xAxisType': 'pe',
        'yAxisType': 'ou'
      }
    };
    data = this.visulizationService.getCsvData(analytics_data, some_config.chartConfiguration);

    const options = {
      fieldSeparator: ',',
      quoteStrings: '\'',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular2Csv(data, 'My Report', options);
  }

  prepareCardTitle(holders_array: any[]): string {
    const indicators_title = [];
    for (const holder of holders_array) {
      for (const indicator of holder.indicators) {
        if (this.hidden_columns.indexOf(indicator.id) === -1) {
          indicators_title.push(indicator.name);
        }
      }
    }
    return (this.showBottleneck) ? indicators_title.join(', ') + ' Bottleneck Indicators ' : indicators_title.join(', ');

  }

  // handle errors from requests
  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }


  getIndicatorLength(holder) {
    let counter = 0;
    let check = false;
    const indicators = [];
    for (const indicator of holder.indicators) {
      if (this.hidden_columns.indexOf(indicator.id) === -1) {
        counter++;
        indicators.push(indicator);
      }
    }
    if (counter === 1) {
      if (indicators[0].hasOwnProperty('bottleneck_indicators')) {
        if (indicators[0].bottleneck_indicators.length !== 0) {
          check = true;
        }
      }
    }
    return check;
  }

  getBackgroundStyle(visualization_type: string): string {
    if (visualization_type === this.current_visualisation) {
      return '#5BC0DE';
    } else {
      return '#DDD';
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
