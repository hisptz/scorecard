import {Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {FilterService} from "../../shared/services/filter.service";
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {VisulizerService} from "../ng2-dhis-visualizer/visulizer.service";
import {Constants} from "../../shared/costants";
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import { Subscription } from 'rxjs/Rx';
import {Angular2Csv} from "angular2-csv";

const actionMapping:IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
  }
};

@Component({
  selector: 'indicator-card',
  templateUrl: './indicator-card.component.html',
  styleUrls: ['./indicator-card.component.css']
})
export class IndicatorCardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() orgunit_nodes: any = [];
  @Input() current_year: any;
  @Input() current_period_type: any;
  @Input() indicator:any;
  @Input() default_period:any;
  @Input() default_period_type:any;
  @Input() default_orgunit:any;
  @Input() hidden_columns:any = [];
  @Output() show_details = new EventEmitter<any>();
  card_orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: "Select Organisation Unit"
  };

  card_period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: true,
    placeholder: "Select period"
  };
  card_organisationunits: any[] = [];
  card_periods: any[] = [];
  card_selected_orgunits: any[] = [];
  card_selected_periods:any[] = [];
  card_period_type: string = "Quarterly";
  card_year: any;
  showOrgTree:boolean = true;
  showPerTree:boolean = true;

  card_orgUnit: any;
  card_period: any;
  current_visualisation: string = "table";
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
  visualizer_config = {
    'type': 'table',
    'tableConfiguration': {
    'title': 'My chart',
      'rows': ['ou', 'dx'] ,
      'columns': ['pe']
    },
    'chartConfiguration': {
      'type':'line',
      'show_labels':false,
      'title': 'My chart',
      'xAxisType': 'pe',
      'yAxisType': 'dx'
    }
  };
  show_labels:boolean = false;

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

  chart_settings: string = "ou-pe";
  showBottleneck:boolean = false;
  error_occured: boolean = false;

  constructor(private filterService: FilterService,
              private visulizationService: VisulizerService,
              private constant: Constants,
              private http: Http
  ) {

  }

  ngOnInit() {
    this.card_organisationunits = this.orgunit_nodes;
    this.card_period_type = this.current_period_type;
    this.card_year = this.current_year;
    this.card_periods = this.filterService.getPeriodArray( this.default_period_type, this.card_year );


  }

  ngAfterViewInit(){
    this.activateNode( this.default_period.id, this.pertree );
    this.activateNode( this.default_orgunit.id, this.orgtree );
    // for( let item of this.default_orgunit.children ){
    //   let nod = this.orgtree.treeModel.getNodeById(item.id);
    //   // this.card_selected_orgunits.push(nod.data);
    // }
    this.updateIndicatorCard(this.indicator, "table", [this.default_period], [this.default_orgunit], true);

  }

  // a call that will change the view type
  details_indicators: string = '';
  updateIndicatorCard( holders: any[], type: string, periods: any[], orgunits: any[], with_children:boolean = false, show_labels:boolean = false ){
    console.log("Orgunits:", orgunits);
    this.loading = true;
    this.chartData = {};
    this.current_visualisation = (type != 'csv')?type:this.current_visualisation;
    //make sure that orgunit and period selections are closed
    this.showOrgTree = true;
    this.showPerTree = true;
    // construct metadata array
    let indicatorsArray = [];
    let orgUnitsArray = [];
    let periodArray = [];

    // check first if your supposed to load bottleneck indicators too for analysis
    let config_array = this.chart_settings.split( "-" );
    if( this.showBottleneck ){
      for ( let holder of holders ){
        for ( let item of holder.indicators ){
          if( this.hidden_columns.indexOf( item.id ) == -1){
            // indicatorsArray.push( item.id );
            if( item.hasOwnProperty("bottleneck_indicators") ){
              for( let bottleneck of item.bottleneck_indicators ){
                indicatorsArray.push( bottleneck.id );
              }
            }
          }
        }
      }
      config_array[1] = 'dx';
      config_array[0] = 'ou';
      type = "column";
      this.visualizer_config.type = 'chart';
    }else{
      for ( let holder of holders ){
        for ( let item of holder.indicators ){
          if( this.hidden_columns.indexOf( item.id ) == -1){
            indicatorsArray.push( item.id );
          }
        }
      }
    }


    if( type == "table" ){
      this.visualizer_config = {
        'type': 'table',
        'tableConfiguration': {
          'title': this.prepareCardTitle(this.indicator),
          'rows': ['ou'],
          'columns': ['dx','pe']
        },
        'chartConfiguration': {
          'type':type,
          'show_labels':show_labels,
          'title': this.prepareCardTitle( this.indicator ),
          'xAxisType': 'pe',
          'yAxisType': 'ou'
        }
      }
    }
    else if ( type == "csv" ) {

    }else if ( type == "info" ) {
      this.details_indicators = indicatorsArray.join( ";" );
      this.visualizer_config.type = "info"

    }
    else{
      this.visualizer_config = {
        'type': 'chart',
        'tableConfiguration': {
          'title': this.prepareCardTitle( this.indicator ),
          'rows': ['ou'] ,
          'columns': ['pe']
        },
        'chartConfiguration': {
          'type':type,
          'show_labels':show_labels,
          'title': this.prepareCardTitle( this.indicator ),
          'xAxisType': config_array[1],
          'yAxisType': config_array[0]
        }
      };
    }
    //if there is no change of parameters from last request dont go to server
    if (type == "info") {

      this.loading = false;
    }else{
      if( this.checkIfParametersChanged( orgunits, periods, indicatorsArray ) ){
        this.error_occured = false;
        this.loading = false;
        if(type == "csv"){
          this.downloadCSV( this.current_analytics_data );
        }else{
          this.chartData = this.visulizationService.drawChart( this.current_analytics_data, this.visualizer_config.chartConfiguration );
          this.tableData = this.visulizationService.drawTable( this.current_analytics_data, this.visualizer_config.tableConfiguration );
        }
      }
      else{
        this.current_parameters = [];
        for ( let item of periods ){
          periodArray.push(item.id);
          this.current_parameters.push(item.id);
        }for ( let item of orgunits ){
          orgUnitsArray.push(item.id);
          this.current_parameters.push(item.id);
          if( with_children && item.hasOwnProperty('children') ){
            for ( let child of item.children ){
              orgUnitsArray.push(child.id);
              this.current_parameters.push(child.id);
            }
          }
        }
        // create an api analytics call
        let url = this.constant.root_dir+"api/analytics.json?dimension=dx:" + indicatorsArray.join(";") + "&dimension=ou:" + orgUnitsArray.join(";") + "&dimension=pe:" + periodArray.join(";") + "&displayProperty=NAME";

        this.subscription = this.loadAnalytics(url).subscribe(
          (data) => {
            this.current_analytics_data = data;
            this.loading = false;
            if(type == "csv"){
              this.downloadCSV(data);
            }else{
              this.chartData = this.visulizationService.drawChart( data, this.visualizer_config.chartConfiguration );
              this.tableData = this.visulizationService.drawTable( data, this.visualizer_config.tableConfiguration );
            }
            this.error_occured = false;
          },
          error => {
            this.error_occured = true;
            console.log(error)
          }
        )
      }
    }



  }

  checkIfParametersChanged(orgunits, periods, indicators): boolean{
    let checker = false;
    let temp_arr = [];
    for ( let per of periods ){
      temp_arr.push(per.id);
    }
    for( let org of orgunits ){
      temp_arr.push(org.id);
    }
    for( let indicator of indicators ){
      temp_arr.push(indicator);
    }
    if(this.current_parameters.length != 0 && temp_arr.length == this.current_parameters.length ){
      checker = temp_arr.sort().join(",") == this.current_parameters.sort().join(",")
    }else{
      checker = false;
    }
    return checker
  }

  // a function to reverse the content of X axis and Y axis
  switchXandY(type, show_labels:boolean=false){
    if(type == "table"){
      if(this.visualizer_config.tableConfiguration.rows[0] == "ou"){
        this.visualizer_config = {
          'type': 'table',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['pe'],
            'columns':['dx','ou']
          },
          'chartConfiguration': {
            'type':type,
            'show_labels':show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': 'ou',
            'yAxisType': 'pe'
          }
        }
      }else if(this.visualizer_config.tableConfiguration.rows[0] == "pe"){
        this.visualizer_config = {
          'type': 'table',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['ou'],
            'columns': ['dx','pe']
          },
          'chartConfiguration': {
            'type':type,
            'show_labels':show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': 'pe',
            'yAxisType': 'ou'
          }
        }
      }

    }
    else if (type == "csv") {

    }else if (type == "info") {
    }
    else{
      let config_array = this.chart_settings.split("-");
      if(this.visualizer_config.chartConfiguration.xAxisType == config_array[0]){
        this.visualizer_config = {
          'type': 'chart',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['pe'],
            'columns':['dx','ou']
          },
          'chartConfiguration': {
            'type':type,
            'show_labels':show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': config_array[1],
            'yAxisType': config_array[0]
          }
        }
      }
      else if(this.visualizer_config.chartConfiguration.xAxisType == config_array[1]){
        this.visualizer_config = {
          'type': 'chart',
          'tableConfiguration': {
            'title': this.prepareCardTitle(this.indicator),
            'rows': ['ou'],
            'columns': ['dx','pe']
          },
          'chartConfiguration': {
            'type':type,
            'show_labels':show_labels,
            'title': this.prepareCardTitle(this.indicator),
            'xAxisType': config_array[0],
            'yAxisType': config_array[1]
          }
        }
      }
    }
    this.chartData = this.visulizationService.drawChart( this.current_analytics_data, this.visualizer_config.chartConfiguration );
    this.tableData = this.visulizationService.drawTable( this.current_analytics_data, this.visualizer_config.tableConfiguration );

  }

  // adding one year to the list of period
  pushPeriodForward(){
    this.card_year += 1;
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type,this.card_year);
  }

  // minus one year to the list of period
  pushPeriodBackward(){
    this.card_year -= 1;
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type,this.card_year);
  }

  // react to period changes
  changePeriodType(){
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type,this.card_year);
  }

  // display Orgunit Tree
  displayOrgTree(){
    this.showOrgTree = !this.showOrgTree;
  }

  // display period Tree
  displayPerTree(){
    this.showPerTree = !this.showPerTree;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivateOrg ( $event ) {
    this.card_selected_orgunits.forEach((item,index) => {
      if( $event.node.data.id == item.id ) {
        this.card_selected_orgunits.splice(index, 1);
      }
    });
  };

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivatePer ( $event ) {
    this.card_selected_periods.forEach((item,index) => {
      if( $event.node.data.id == item.id ) {
        this.card_selected_periods.splice(index, 1);
      }
    });
  };

  // add item to array of selected items when organisation unit is selected
  activateOrg = ($event) => {
    this.card_selected_orgunits.push($event.node.data);
    this.card_orgUnit = $event.node.data;
  };

  // add item to array of selected items when period is selected
  activatePer = ($event) => {
    this.card_selected_periods.push($event.node.data);
    this.card_period = $event.node.data;
  };

  activateNode(nodeId:any, nodes){
    setTimeout(() => {
      let node = nodes.treeModel.getNodeById(nodeId);
      if (node)
        // node.toggleActivated();
        node.setIsActive(true);
    }, 0);
  }

  // function that is used to filter nodes
  filterNodes(text, tree, type:string = null) {
    if(type == "orgunit"){
      if(text.length >=3 ){
        tree.treeModel.filterNodes(text, true);
      }else if(text.length == 0){
        tree.treeModel.filterNodes('', false);
      }
    }else{
      tree.treeModel.filterNodes(text, true);
    }
  }

  // custom settings for tree
  customTemplateStringOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

  // a function to simplify loading of analytics data
  loadAnalytics(url) {
    return this.http.get(url)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  // hide the model
  removeModel(){
    this.show_details.emit(false);
  }

  // prepare scorecard data and download them as csv
  downloadCSV(analytics_data){
    let data = [];
    let some_config = {
      'type': 'chart',
      'tableConfiguration': {
        'title': this.prepareCardTitle(this.indicator),
        'rows': ['ou', 'dx'] ,
        'columns': ['pe']
      },
      'chartConfiguration': {
        'type':'bar',
        'title': this.prepareCardTitle(this.indicator),
        'xAxisType': 'pe',
        'yAxisType': 'ou'
      }
    };
    data = this.visulizationService.getCsvData(analytics_data, some_config.chartConfiguration);

    let options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular2Csv(data, 'My Report', options);
  }

  prepareCardTitle(holders_array: any[]): string{
    let indicators_title = [];
    for ( let holder of holders_array ){
      for ( let indicator of holder.indicators ){
        if( this.hidden_columns.indexOf(indicator.id) == -1){
          indicators_title.push(indicator.name);
        }
      }
    }
    return (this.showBottleneck)?indicators_title.join(", ")+" Bottleneck Indicators ":indicators_title.join(", ");

  }

  // handle errors from requests
  private handleError (error: Response | any) {
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


  getIndicatorLength(holder){
    let counter = 0;
    let check = false;
    let indicators = [];
    for( let indicator of holder.indicators ){
      if( this.hidden_columns.indexOf(indicator.id) == -1){
        counter++;
        indicators.push(indicator);
      }
    }
    if ( counter == 1){
      if( indicators[0].hasOwnProperty("bottleneck_indicators") ){
        if(indicators[0].bottleneck_indicators.length != 0){
          check = true
        }
      }
    }
    return check;
  }

  getBackgroundStyle(visualization_type:string):string{
    if( visualization_type == this.current_visualisation ){
      return "#5BC0DE";
    }else{
      return "#DDD";
    }
  }

  ngOnDestroy (){
    if( this.subscription ){
      this.subscription.unsubscribe();
    }
  }
}
