import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { VisualizerService } from '../../shared/services/visualizer.service';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { HttpClientService } from '../../shared/services/http-client.service';
import { LayoutModel } from '../../shared/components/layout/layout-model';
import { CHART_TYPES } from './chart_types';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  @Input() indicatorDetails: any;
  @Output() onClose = new EventEmitter();
  orgUnitModel: any = null;
  selectedPeriod: any;
  periodType: any;
  year: any;
  indicator: any = [];
  functions: any = [];
  hidden_columns: any = [];
  current_parameters: any = [];
  selectedOrganisationUnit: any;
  periodObject: any;
  showTrend = false;
  loading = true;
  showBottleneck = false;
  error_occured = false;
  current_visualisation = 'table';
  current_analytics_data: any = null;
  current_title: any = null;
  private subscription: Subscription;
  chartData: any = {};
  tableData: any = {};
  bottleneck_first_time = false;
  details_indicators = '';
  layoutVisualizationType = 'TABLE';
  visualizer_config: any = {
    type: 'table',
    tableConfiguration: {
      title: 'My chart',
      rows: ['ou', 'dx'],
      columns: ['pe']
    },
    chartConfiguration: {
      type: 'line',
      show_labels: false,
      title: 'My chart',
      xAxisType: 'pe',
      yAxisType: 'dx'
    }
  };

  layoutModel: LayoutModel = {
    rows: [
      {
        name: 'Organisation Units',
        value: 'ou'
      }
    ],
    columns: [
      {
        name: 'Data',
        value: 'dx'
      },
      {
        name: 'Period',
        value: 'pe'
      }
    ],
    filters: [],
    excluded: [
      {
        name: 'Excluded Dimension',
        value: 'co'
      }
    ]
  };

  geoFeatures: any[] = [];

  chartTypes = CHART_TYPES;
  show_labels = false;
  currentChartType = 'column';

  constructor(
    private visulizationService: VisualizerService,
    private http: HttpClientService
  ) {}

  ngOnInit() {
    this.orgUnitModel = this.indicatorDetails.ou_model;
    this.selectedPeriod = this.indicatorDetails.period_list;
    this.periodType = this.indicatorDetails.pe_type;
    this.year = this.indicatorDetails.year;
    this.indicator = this.indicatorDetails.selected_indicator;
    this.functions = this.indicatorDetails.functions;
    this.hidden_columns = this.indicatorDetails.hidden_columns;
    this.selectedOrganisationUnit = this.indicatorDetails.selectedOrganisationUnit;
    this.periodObject = this.indicatorDetails.periodObject;
    this.showTrend = this.indicatorDetails.trend;
    this.showBottleneck = this.indicatorDetails.bottleneck;
    // @TODO checking constence on period types from indicator detail as well as period filter
    // this.updateType(this.showBottleneck ? '' : 'table');
  }

  closeModel() {
    this.onClose.emit();
  }

  updateChartType(type: string) {
    this.currentChartType = type;
    this.updateType('chart');
  }

  updateLayout(layoutModel) {
    this.layoutModel = layoutModel;
    this.updateType(this.visualizer_config.type);
  }

  changeOrgUnit($event) {
    this.selectedOrganisationUnit = $event;
  }
  updateOrgUnit($event) {
    this.selectedOrganisationUnit = $event;
    this.updateType(this.visualizer_config.type);
  }

  changePeriod($event) {
    this.periodObject = $event;
  }

  updatePeriod($event) {
    this.periodObject = $event;
    if (this.showBottleneck) {
      this.updateType('');
    } else {
      this.updateType(this.visualizer_config.type);
    }
  }
  // get function details from id
  getFunction(id: string) {
    return _.find(this.functions, { id });
  }

  // get rule from a function details from id
  getFunctionRule(rules, id) {
    let return_rule = null;
    const filtered_rule = _.find(rules, { id });
    if (filtered_rule && filtered_rule.id) {
      return_rule = _.cloneDeep(filtered_rule);
      if (typeof return_rule.json === 'string') {
        return_rule.json = JSON.parse(return_rule.json);
      }
    }
    return return_rule;
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
    return indicators_title.join(', ');
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
      if (indicators[0].hasOwnProperty('use_bottleneck_groups')) {
        if (indicators[0].use_bottleneck_groups) {
          if (indicators[0].bottleneck_indicators_groups.length !== 0) {
            check = true;
          }
        } else {
          if (indicators[0].bottleneck_indicators.length !== 0) {
            check = true;
          }
        }
      } else {
        if (indicators[0].hasOwnProperty('bottleneck_indicators')) {
          if (indicators[0].bottleneck_indicators.length !== 0) {
            check = true;
          }
        }
      }
    }
    return check;
  }

  // prepare scorecard data and download them as csv
  downloadCSV(analytics_data) {
    let data = [];
    const some_config = {
      type: 'chart',
      tableConfiguration: {
        title: this.prepareCardTitle(this.indicator),
        rows: ['ou', 'dx'],
        columns: ['pe']
      },
      chartConfiguration: {
        type: 'bar',
        title: this.prepareCardTitle(this.indicator),
        xAxisType: 'pe',
        yAxisType: 'ou'
      }
    };
    data = this.visulizationService.getCsvData(
      analytics_data,
      some_config.chartConfiguration
    );

    const options = {
      fieldSeparator: ',',
      quoteStrings: "'",
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular5Csv(data, 'My Report', { headers: Object.keys(data[0]) });
  }

  getStartingLayout(type): LayoutModel {
    if (type === 'bottleneck') {
      return {
        rows: [
          {
            name: 'Organisation Units',
            value: 'ou'
          }
        ],
        columns: [
          {
            name: 'Data',
            value: 'dx'
          },
          {
            name: 'Period',
            value: 'pe'
          }
        ],
        filters: [],
        excluded: [
          {
            name: 'Excluded Dimension',
            value: 'co'
          }
        ]
      };
    } else if (type === 'trend') {
      return {
        rows: [
          {
            name: 'Data',
            value: 'dx'
          }
        ],
        columns: [
          {
            name: 'Period',
            value: 'pe'
          }
        ],
        filters: [
          {
            name: 'Organisation Units',
            value: 'ou'
          }
        ],
        excluded: [
          {
            name: 'Excluded Dimension',
            value: 'co'
          }
        ]
      };
    } else {
      return {
        rows: [
          {
            name: 'Organisation Units',
            value: 'ou'
          }
        ],
        columns: [
          {
            name: 'Period',
            value: 'pe'
          }
        ],
        filters: [
          {
            name: 'Data',
            value: 'dx'
          }
        ],
        excluded: [
          {
            name: 'Excluded Dimension',
            value: 'co'
          }
        ]
      };
    }
  }

  // a call that will change the view type
  updateType(type: string) {
    if (type !== '') {
      this.showBottleneck = false;
    }
    const analytics_calls = [];
    let dataGroups = null;
    // cancel the current call if still in progress when switching between charts
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.loading = true;
    this.chartData = {};
    this.current_visualisation =
      type !== 'csv' ? type : this.current_visualisation;
    // make sure that orgunit and period selections are closed
    // construct metadata array
    const indicatorsArray = [];
    const function_indicatorsArray = [];

    // check first if your supposed to load bottleneck indicators too for analysis
    let labels = null;
    let names = {};
    let titles = {};
    const namesArr = [];
    const titlesArr = [];
    const colors = [];
    const chartColors = [
      '#7DB2E8',
      '#80CC33',
      '#40BF80',
      '#75F0F0',
      '#9485E0',
      '#D98CCC',
      '#D98C99',
      '#D9998C',
      '#9485E0',
      '#E09485',
      '#F7B26E',
      '#E6C419',
      '#BFBF40',
      '#E09485',
      '#80CC33',
      '#40BF80',
      '#75F0F0'
    ];
    let colorCount = 0;
    if (this.showBottleneck) {
      labels = [];
      const groupCateries = [];
      let useGroups = false;
      for (const holder of this.indicator) {
        for (const item of holder.indicators) {
          if (this.hidden_columns.indexOf(item.id) === -1) {
            if (item.use_bottleneck_groups) {
              for (const bottleneck of item.bottleneck_indicators_groups) {
                groupCateries.push({
                  name: bottleneck.name,
                  categories: bottleneck.items.map(i => i.bottleneck_title)
                });
                if (bottleneck.hasOwnProperty('color')) {
                  colors.push(...bottleneck.items.map(i => bottleneck.color));
                } else {
                  colors.push(
                    ...bottleneck.items.map(i => chartColors[colorCount])
                  );
                }
                colorCount = colorCount + 1;
                useGroups = true;
                for (const b_item of bottleneck.items) {
                  if (b_item.hasOwnProperty('function')) {
                    function_indicatorsArray.push(b_item);
                  } else {
                    indicatorsArray.push(b_item.id);
                  }
                }
                labels.push(
                  ...bottleneck.items.map(i => {
                    return { id: i.id, name: i.bottleneck_title };
                  })
                );
                namesArr.push(
                  ...bottleneck.items.map(i => {
                    return {
                      id: i.bottleneck_title + ':' + bottleneck.name,
                      name: i.name
                    };
                  })
                );
                titlesArr.push(
                  ...bottleneck.items.map(i => {
                    return { id: i.bottleneck_title, name: i.name };
                  })
                );
                names = this.getEntities(namesArr, names);
                titles = this.getEntities(titlesArr, titles);
              }
            } else {
              useGroups = true;
              for (const bottleneck of item.bottleneck_indicators) {
                if (bottleneck.hasOwnProperty('function')) {
                  function_indicatorsArray.push(bottleneck);
                } else {
                  indicatorsArray.push(bottleneck.id);
                }
                labels.push({
                  id: bottleneck.id,
                  name: bottleneck.bottleneck_title
                });
                namesArr.push({
                  id: bottleneck.bottleneck_title,
                  name: bottleneck.name
                });
                names = this.getEntities(namesArr, names);
              }
            }
            if (item.hasOwnProperty('bottleneck_indicators')) {
            }
          }
        }
      }
      if (groupCateries.length === 0) {
        dataGroups = null;
      } else {
        dataGroups = groupCateries;
      }
      if (this.bottleneck_first_time) {
        type = 'column';
        this.current_visualisation = 'column';
        this.layoutModel = this.getStartingLayout('bottleneck');
        // this.chart_settings = 'ou-dx';
        this.visualizer_config.type = 'chart';
        this.visualizer_config.rotation = 0;
        this.bottleneck_first_time = false;
      }
    } else {
      labels = [];
      for (const holder of this.indicator) {
        for (const item of holder.indicators) {
          if (this.hidden_columns.indexOf(item.id) === -1) {
            if (
              item.hasOwnProperty('calculation') &&
              item.calculation === 'custom_function'
            ) {
              function_indicatorsArray.push({
                ...item,
                function: item.function_to_use
              });
            } else {
              indicatorsArray.push(item.id);
            }
            labels.push({ id: item.id, name: item.title });
            namesArr.push({ id: item.bottleneck_title, name: item.name });
            names = this.getEntities(namesArr, names);
          }
        }
      }
    }
    if (this.showTrend) {
      type = 'line';
      this.currentChartType = 'line';
      this.layoutModel = this.getStartingLayout('trend');
      // this.chart_settings = 'ou-dx';
      this.visualizer_config.type = 'chart';
      this.showTrend = false;
    }
    this.details_indicators = indicatorsArray.join(';');
    // const config_array = this.chart_settings.split('-');
    if (type === 'table') {
      this.layoutVisualizationType = 'TABLE';
      this.visualizer_config = {
        type: 'table',
        tableConfiguration: {
          title: this.prepareCardTitle(this.indicator),
          rows: this.layoutModel.rows.map(item => item.value),
          columns: this.layoutModel.columns.map(item => item.value),
          labels: labels
        },
        chartConfiguration: {
          type: this.currentChartType,
          show_labels: this.show_labels,
          title: this.prepareCardTitle(this.indicator),
          xAxisType: this.layoutModel.columns[0].value,
          yAxisType: this.layoutModel.rows[0].value,
          labels: labels
        }
      };
    } else if (type === 'csv') {
    } else if (type === 'map') {
      this.visualizer_config.type = 'map';
    } else if (type === 'info') {
      this.visualizer_config.type = 'info';
      this.loading = false;
    } else {
      this.layoutVisualizationType = 'CHART';
      this.visualizer_config = {
        type: 'chart',
        tableConfiguration: {
          title: this.prepareCardTitle(this.indicator),
          rows: [this.layoutModel.rows[0].value],
          columns: [this.layoutModel.columns[0].value],
          labels: labels
        },
        chartConfiguration: {
          type: this.currentChartType,
          show_labels: this.show_labels,
          title: this.prepareCardTitle(this.indicator),
          xAxisType: this.layoutModel.columns[0].value,
          yAxisType: this.layoutModel.rows[0].value,
          labels: labels,
          dataGroups: dataGroups
        }
      };
      if (this.showBottleneck) {
        this.visualizer_config.chartConfiguration.rotation = 0;
        if (dataGroups !== null) {
          this.visualizer_config.chartConfiguration.tooltipItems = names;
          this.visualizer_config.chartConfiguration.titlesItems = titles;
          this.visualizer_config.chartConfiguration.colors = colors;
        }
      }
    }
    // if there is no change of parameters from last request dont go to server
    if (type === 'info') {
      this.loading = false;
    } else {
      this.current_title = this.prepareCardTitle(this.indicator);
      if (
        this.checkIfParametersChanged(
          this.selectedOrganisationUnit.value,
          this.periodObject.value,
          indicatorsArray,
          function_indicatorsArray
        )
      ) {
        this.error_occured = false;
        if (type === 'csv') {
          this.downloadCSV(this.current_analytics_data);
        } else {
          this.chartData = this.visulizationService.drawChart(
            this.current_analytics_data,
            this.visualizer_config.chartConfiguration
          );
          this.tableData = this.visulizationService.drawTable(
            this.current_analytics_data,
            this.visualizer_config.tableConfiguration
          );
        }
        this.loading = false;
      } else {
        // create an api analytics call
        if (indicatorsArray.length === labels.length) {
          const url =
            'analytics.json?dimension=dx:' +
            indicatorsArray.join(';') +
            '&dimension=ou:' +
            this.selectedOrganisationUnit.value +
            '&dimension=pe:' +
            this.periodObject.value +
            '&displayProperty=NAME';
          this.subscription = this.loadAnalytics(url).subscribe(
            data => {
              this.current_analytics_data = data;
              this.loading = false;
              if (type === 'csv') {
                this.downloadCSV(data);
              } else {
                this.chartData = this.visulizationService.drawChart(
                  data,
                  this.visualizer_config.chartConfiguration
                );
                this.tableData = this.visulizationService.drawTable(
                  data,
                  this.visualizer_config.tableConfiguration
                );
              }
              this.error_occured = false;
            },
            error => {
              this.error_occured = true;
            }
          );
        } else {
          if (indicatorsArray.length !== 0) {
            let completed_functions = 0;
            const url =
              'analytics.json?dimension=dx:' +
              indicatorsArray.join(';') +
              '&dimension=pe:' +
              this.periodObject.value +
              '&dimension=ou:' +
              this.selectedOrganisationUnit.value +
              '&displayProperty=NAME';
            this.subscription = this.loadAnalytics(url).subscribe(
              data => {
                analytics_calls.push(
                  this.visulizationService._sanitizeIncomingAnalytics(data)
                );
                if (function_indicatorsArray.length !== 0) {
                  function_indicatorsArray.forEach(indicator_item => {
                    const use_function = this.getFunction(
                      indicator_item.function
                    );
                    const parameters = {
                      dx: indicator_item.id,
                      ou: this.selectedOrganisationUnit.value,
                      pe: this.periodObject.value,
                      rule: this.getFunctionRule(
                        use_function['rules'],
                        indicator_item.id
                      ),
                      success: function_data => {
                        completed_functions++;
                        analytics_calls.push(function_data);
                        if (
                          completed_functions ===
                          function_indicatorsArray.length
                        ) {
                          this.current_analytics_data = this.mergeAnalyticsCalls(
                            analytics_calls,
                            labels
                          );
                          this.loading = false;
                          if (type === 'csv') {
                            this.downloadCSV(data);
                          } else {
                            this.chartData = this.visulizationService.drawChart(
                              this.current_analytics_data,
                              this.visualizer_config.chartConfiguration
                            );
                            this.tableData = this.visulizationService.drawTable(
                              this.current_analytics_data,
                              this.visualizer_config.tableConfiguration
                            );
                          }
                          this.error_occured = false;
                        }
                      },
                      error: error => {
                        completed_functions++;
                        this.error_occured = true;
                      },
                      progress: progress => {}
                    };
                    const execute = Function(
                      'parameters',
                      use_function['function']
                    );
                    execute(parameters);
                  });
                }
              },
              error => {
                this.error_occured = true;
              }
            );
          } else {
            if (function_indicatorsArray.length !== 0) {
              let completed_functions = 0;
              function_indicatorsArray.forEach(indicator_item => {
                const use_function = this.getFunction(indicator_item.function);
                const parameters = {
                  dx: indicator_item.id,
                  ou: this.selectedOrganisationUnit.value,
                  pe: this.periodObject.value,
                  rule: this.getFunctionRule(
                    use_function['rules'],
                    indicator_item.id
                  ),
                  success: function_data => {
                    completed_functions++;
                    analytics_calls.push(
                      this.visulizationService._sanitizeIncomingAnalytics(
                        function_data
                      )
                    );
                    if (
                      completed_functions === function_indicatorsArray.length
                    ) {
                      this.current_analytics_data =
                        analytics_calls && analytics_calls.length === 1
                          ? analytics_calls[0]
                          : this.mergeAnalyticsCalls(analytics_calls, labels);
                      this.loading = false;
                      if (type === 'csv') {
                      } else {
                        this.chartData = this.visulizationService.drawChart(
                          this.current_analytics_data,
                          this.visualizer_config.chartConfiguration
                        );
                        this.tableData = this.visulizationService.drawTable(
                          this.current_analytics_data,
                          this.visualizer_config.tableConfiguration
                        );
                      }
                      this.error_occured = false;
                    }
                  },
                  error: error => {
                    completed_functions++;
                    this.error_occured = true;
                  },
                  progress: progress => {}
                };
                const execute = Function(
                  'parameters',
                  use_function['function']
                );
                execute(parameters);
              });
            }
          }
        }
      }
    }
  }

  getEntities(itemArray, initialValues) {
    const entities = itemArray.reduce(
      (items: { [id: string]: any }, item: any) => {
        return {
          ...items,
          [item.id]: item
        };
      },
      {
        ...initialValues
      }
    );
    return entities;
  }

  checkIfParametersChanged(
    orgunits,
    periods,
    indicators,
    function_indicatorsArray
  ): boolean {
    let checker = false;
    const temp_arr = [];
    for (const per of periods.split(';')) {
      temp_arr.push(per);
    }
    for (const org of orgunits.split(';')) {
      temp_arr.push(org);
    }
    for (const indicator of indicators) {
      temp_arr.push(indicator);
    }
    for (const indicator of function_indicatorsArray) {
      temp_arr.push(indicator.id);
    }
    if (
      this.current_parameters.length !== 0 &&
      temp_arr.length === this.current_parameters.length
    ) {
      checker =
        temp_arr.sort().join(',') === this.current_parameters.sort().join(',');
    } else {
      checker = false;
    }
    this.current_parameters = temp_arr;
    return checker;
  }

  // Merge analytics calls before displaying them
  // merge analytics calls
  mergeAnalyticsCalls(analytics: any[], itemList: any) {
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

    analytics.forEach(analytic => {
      combined_analytics.headers = analytic.headers;
      const namesArray = this._getArrayFromObject(analytic.metaData.names);
      namesArray.forEach(name => {
        if (!combined_analytics.metaData.names[name.id]) {
          combined_analytics.metaData.names[name.id] = name.value;
        }
      });
      analytic.metaData.dx.forEach(val => {
        if (!_.includes(combined_analytics.metaData.dx, val)) {
          combined_analytics.metaData.dx.push(val);
        }
      });
      analytic.metaData.ou.forEach(val => {
        if (!_.includes(combined_analytics.metaData.ou, val)) {
          combined_analytics.metaData.ou.push(val);
        }
      });
      analytic.metaData.pe.forEach(val => {
        if (!_.includes(combined_analytics.metaData.pe, val)) {
          combined_analytics.metaData.pe.push(val);
        }
      });
      const newDxOrder = [];
      itemList.forEach(listItem => {
        newDxOrder.push(listItem.id);
      });
      combined_analytics.metaData.dx = newDxOrder;
      analytic.rows.forEach(row => {
        combined_analytics.height += 1;
        combined_analytics.width = row.length;
        combined_analytics.rows.push(row);
      });
    });

    return combined_analytics;
  }

  getOrgUnitsForAnalytics(orgunit_model: any, with_children: boolean): string {
    return 'it works';
  }

  // a function to simplify loading of analytics data
  loadAnalytics(url) {
    return this.http.get(url);
  }

  private _getArrayFromObject(object) {
    return _.map(object, function(value, prop) {
      return { id: prop, value: value };
    });
  }

  switchBottleneck() {}
}
