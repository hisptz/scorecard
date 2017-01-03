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
      'rows': ['ou', 'dx'] ,
      'columns': ['pe']
    },
    'chartConfiguration': {
      'type':'line',
      'title': 'My chart',
      'xAxisType': 'pe',
      'yAxisType': 'dx'
    }
  };

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
    console.log("Orgunits:",this.default_orgunit);
    console.log("Periods:",this.default_period);
    console.log("Period Type:",this.default_period_type);
    console.log("indicator:", this.indicator);
    this.activateNode( this.default_period.id, this.pertree );
    this.activateNode( this.default_orgunit.id, this.orgtree );

    this.updateIndicatorCard(this.indicator, "table", [this.default_period], [this.default_orgunit], true);

  }

  // a call that will change the view type
  updateIndicatorCard( holders: any[], type: string, periods: any[], orgunits: any[], with_children:boolean = false ){
    this.loading = true;
    this.current_visualisation = type;
    //make sure that orgunit and period selections are closed
    this.showOrgTree = true;
    this.showPerTree = true;
    // construct metadata array
    let indicatorsArray = [];
    let orgUnitsArray = [];
    let periodArray = [];
    for ( let holder of holders){
      for ( let item of holder.indicators ){
        indicatorsArray.push(item.id);
      }
    }
    for ( let item of periods ){
      periodArray.push(item.id);
    }for ( let item of orgunits ){
      orgUnitsArray.push(item.id);
      if( with_children ){
        for ( let child of item.children ){
          orgUnitsArray.push(child.id)
        }
      }
    }

    if(type == "table"){
      this.visualizer_config = {
        'type': 'table',
        'tableConfiguration': {
          'rows': ['ou'],
          'columns': ['dx','pe']
        },
        'chartConfiguration': {
          'type':type,
          'title': 'My chart',
          'xAxisType': 'pe',
          'yAxisType': 'ou'
        }
      }
    }else{
      this.visualizer_config = {
        'type': 'chart',
        'tableConfiguration': {
          'rows': ['ou'] ,
          'columns': ['pe']
        },
        'chartConfiguration': {
          'type':type,
          'title': 'My chart',
          'xAxisType': 'pe',
          'yAxisType': 'ou'
        }
      };
    }



    // create an api analytics call
    let url = this.constant.root_dir+"api/analytics.json?dimension=dx:" + indicatorsArray.join(";") + "&dimension=ou:" + orgUnitsArray.join(";") + "&dimension=pe:" + periodArray.join(";") + "&displayProperty=NAME";

    this.subscription = this.loadAnalytics(url).subscribe(
      (data) => {
        this.loading = false;
        if(type == "csv"){
          this.downloadCSV(data);
        }else{
          this.chartData = this.visulizationService.drawChart( data, this.visualizer_config.chartConfiguration );
          this.tableData = this.visulizationService.drawTable( data, this.visualizer_config.tableConfiguration );
        }
      },
      error => {
        console.log(error)
      }
    )

  }

  // a function to reverse the content of X axis and Y axis
  switchXandY(indicator){

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
    console.log(nodeId);
    setTimeout(() => {
      let node = nodes.treeModel.getNodeById(nodeId);
      if (node)
        // node.toggleActivated();
        node.setIsActive(true);
    }, 0);
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  // custom settings for tree
  customTemplateStringOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

  // update chart
  updateChart(){
    this.visualizer_config = {
      'type': 'chart',
      'tableConfiguration': {
        'rows': ['ou', 'dx'] ,
        'columns': ['pe']
      },
      'chartConfiguration': {
        'type':'line',
        'title': 'My chart',
        'xAxisType': 'pe',
        'yAxisType': 'dx'
      }
    };
  }

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
    let visualizer_config = {
      'type': 'chart',
      'tableConfiguration': {
        'rows': ['ou', 'dx'] ,
        'columns': ['pe']
      },
      'chartConfiguration': {
        'type':'bar',
        'title': 'My chart',
        'xAxisType': 'pe',
        'yAxisType': 'dx'
      }
    }
    let chartObject = this.visulizationService.drawChart(analytics_data, visualizer_config.chartConfiguration)
    let items = [];
    for ( let value of chartObject.series){
      let obj = {name:value.name};
      let i = 0;
      for( let val of chartObject.options.xAxis.categories){
        obj[val] = value.data[i];
        i++;
      };
      items.push(obj);
      data.push(obj);
    };
    // for ( let current_orgunit of this.orgUnit.children ){
    //   let dataobject = {};
    //   dataobject['orgunit'] = current_orgunit.name;
    //   for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
    //     for( let indicator of holder.indicators ){
    //       dataobject[indicator.title] = indicator.values[current_orgunit.id];
    //     }
    //   }
    //   data.push( dataobject  );
    // }

    let options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular2Csv(data, 'My Report', options);
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

  ngOnDestroy (){
    if( this.subscription ){
      this.subscription.unsubscribe();
    }
  }
}
