import {
  Component, OnInit, AfterViewInit, ViewChild, ValueProvider, style, state, animate, transition, trigger,
  OnDestroy
} from '@angular/core';
import {ScoreCard, ScorecardService} from "../shared/services/scorecard.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {DataService} from "../shared/data.service";
import {FilterService} from "../shared/services/filter.service";
import {Constants} from "../shared/costants";
import {Angular2Csv} from "angular2-csv";
// import Key = webdriver.Key;
import {ScorecardComponent} from "./scorecard/scorecard.component";
import {OrgUnitService} from "../shared/org-unit-filter/org-unit.service";
import {OrgUnitFilterComponent} from "../shared/org-unit-filter/org-unit-filter.component";


const WINDOW_PROVIDER: ValueProvider = {
  provide: Window,
  useValue: window
};

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity:0}),
        animate(600, style({opacity:1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({opacity:0}))
      ])
    ])
  ]
})

export class ViewComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;
  private indicatorCalls: Subscription[] = [];
  scorecard: ScoreCard;
  scorecardId: string;
  orgUnit: any = {};
  period: any = [];
  orgunits: any[] = [];
  loading: boolean = true;
  base_url: string;
  orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: true,
    show_update_button:true,
    loading_message: 'Loading Organisation units...',
    multiple: false,
    multiple_key:"none", //can be control or shift
    placeholder: "Select Organisation Unit"
  };

  period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    period_type: "Monthly",
    loading_message: 'Loading Periods...',
    multiple: false,
    multiple_key:"none", //can be control or shift
    starting_periods: [],
    starting_year: null,
    placeholder: "Select period"
  };
  organisationunits: any[] = [];
  periods: any[] = [];
  selected_orgunits: any[] = [];
  selected_periods:any = [];
  period_type: string = "Quarterly";
  year: number = 2016;
  showOrgTree:boolean = true;
  showPerTree:boolean = true;
  showAdditionalOptions:boolean = true;

  show_details:boolean = false;

  @ViewChild(ScorecardComponent)
  private childScoreCard: ScorecardComponent;

  @ViewChild(OrgUnitFilterComponent)
  private orgUnitComponent: OrgUnitFilterComponent;

  orgtree: any;
  selected_indicator: any = [];
  orgunit_for_model:any = [];

  keep_options_open:boolean = true;

  show_sum_in_row: boolean = false;
  show_sum_in_column: boolean = false;
  show_average_in_row: boolean = false;
  show_average_in_column: boolean = false;
  hide_empty_column: boolean = false;
  hide_empty_rows: boolean = false;

  sortAscending: boolean = true;
  sorting_column: any = "none";
  hidenColums: any[] = [];

  shown_records:number = 0;
  average_selection:string = "all";
  show_rank: boolean = false;
  metadata_ready = false;
  have_authorities:boolean = false;
  orgUnitlength:number = 0;

  orgunit_model: any = {
    selection_mode: "orgUnit",
    selected_level: "",
    selected_group: "",
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    selected_user_orgunit: "USER_ORGUNIT"
  };
  scorecard_ready:boolean = false;

  constructor(private scorecardService: ScorecardService,
              private dataService: DataService,
              private activatedRouter: ActivatedRoute,
              private filterService: FilterService,
              private costant: Constants,
              private orgunitService: OrgUnitService
  ) {
    this.base_url = this.costant.root_dir;
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        this.scorecardId = params['scorecardid'];
        this.scorecard = this.scorecardService.getEmptyScoreCard();
      });
    this.dataService.getUserInformation().subscribe(
      userInfo => {
        //noinspection TypeScriptUnresolvedVariable
        userInfo.userCredentials.userRoles.forEach( (role) => {
          role.authorities.forEach( (ath) => {
            if( ath == "ALL"){
              this.have_authorities = true;
            }
          } );

        })
      }
    )

  }

  ngOnInit() {
    //loading organisation units
    this.scorecardService.load(this.scorecardId).subscribe(
      scorecard_details => {
        this.scorecard = {
          id: this.scorecardId,
          name: scorecard_details.header.title,
          data: scorecard_details
        };
        console.log("settings",this.scorecard.data.orgunit_settings);
        this.period_tree_config.starting_periods = this.scorecard.data.selected_periods;
        this.period_tree_config.period_type = this.scorecard.data.periodType;
        // attach organisation unit if none is defined
        if(!this.scorecard.data.hasOwnProperty("orgunit_settings")){
          this.scorecard.data.orgunit_settings = {
            selection_mode: "Usr_orgUnit",
            selected_level: "",
            show_update_button:true,
            selected_group: "",
            orgunit_levels: [],
            orgunit_groups: [],
            selected_orgunits: [],
            user_orgunits: [],
            type: "report",
            selected_user_orgunit: "USER_ORGUNIT"
          };
        }

        this.orgunit_model = this.scorecard.data.orgunit_settings;
        // attach average_selection if none is defined
        if(!this.scorecard.data.hasOwnProperty("average_selection")){
          this.scorecard.data.average_selection = "all";
        }
        // attach shown_records if none is defined
        if(!this.scorecard.data.hasOwnProperty("shown_records")){
          this.scorecard.data.shown_records = "all";
        }
        // attach show_average_in_row if none is defined
        if(!this.scorecard.data.hasOwnProperty("show_average_in_row")){
          this.scorecard.data.show_average_in_row = false;
        }
        // attach show_average_in_column if none is defined
        if(!this.scorecard.data.hasOwnProperty("show_average_in_column")){
          this.scorecard.data.show_average_in_column = false;
        }
        //attach a property empty row if none is defined
        if(!this.scorecard.data.hasOwnProperty("empty_rows")){
          this.scorecard.data.empty_rows = true;
        }
        if(this.scorecard.data.hasOwnProperty("periodType")){
          this.period_type = this.scorecard.data.periodType
        }
        if(!this.scorecard.data.hasOwnProperty("show_data_in_column")){
          this.scorecard.data.show_data_in_column = false;
        }

        this.metadata_ready =true;

      });

  }

  ngAfterViewInit(){
  }

  initilizeScoreCard($event){
    this.scorecard_ready = $event;
  }

  // this function is used to sort organisation unit
  prepareOrganisationUnitTree(organisationUnit,type:string='top') {
    if (type == "top"){
      if (organisationUnit.children) {
        organisationUnit.children.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });
        organisationUnit.children.forEach((child) => {
          this.prepareOrganisationUnitTree(child,'top');
        })
      }
    }else{
      organisationUnit.forEach((orgunit) => {
        console.log(orgunit);
        if (orgunit.children) {
          orgunit.children.sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
          orgunit.children.forEach((child) => {
            this.prepareOrganisationUnitTree(child,'top');
          })
        }
      });
    }
  }

  // prepare a proper name for updating the organisation unit display area.
  getProperPreOrgunitName() : string{
    let name = "";
    if( this.orgunit_model.selection_mode == "Group" ){
      let use_value = this.orgunit_model.selected_group.split("-");
      for( let single_group of this.orgunit_model.orgunit_groups ){
        if ( single_group.id == use_value[1] ){
          name = single_group.name + " in";
        }
      }
    }else if( this.orgunit_model.selection_mode == "Usr_orgUnit" ){
      if( this.orgunit_model.selected_user_orgunit == "USER_ORGUNIT") name = "User org unit";
      if( this.orgunit_model.selected_user_orgunit == "USER_ORGUNIT_CHILDREN") name = "User sub-units";
      if( this.orgunit_model.selected_user_orgunit == "USER_ORGUNIT_GRANDCHILDREN") name = "User sub-x2-units";
    }else if( this.orgunit_model.selection_mode == "Level" ){
      let use_level = this.orgunit_model.selected_level.split("-");
      for( let single_level of this.orgunit_model.orgunit_levels ){
        if ( single_level.level == use_level[1] ){
          name = single_level.name + " in";
        }
      }
    }else{
      name = "";
    }
    return name
  }

  // a function that will be used to load scorecard
  loadScoreCard( orgunit: any = null ){
    this.showOrgTree = true;
    this.showPerTree = true;
    this.orgUnitlength = (this.orgUnit.children)?this.orgUnit.children.length+1:1;
    this.childScoreCard.loadScoreCard();
  }



  // get the name of period to be used in a tittle
  getPeriodName(id){
    for ( let period of this.filterService.getPeriodArray(this.period_type, this.filterService.getLastPeriod(id,this.period_type).substr(0,4))){
      if( this.filterService.getLastPeriod(id,this.period_type) == period.id){
        return period.name;
      }
    }
  }

  // prepare scorecard data and download them as csv
  downloadCSV(orgunitId){
    // let data = [];
    // let use_orgunit = this.orgtree.treeModel.getNodeById(orgunitId)
    // for ( let current_orgunit of use_orgunit.data.children ){
    //   let dataobject = {};
    //   dataobject['orgunit'] = current_orgunit.name;
    //   for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
    //     for( let indicator of holder.indicators ){
    //       dataobject[indicator.title] = indicator.values[current_orgunit.id];
    //     }
    //   }
    //   data.push( dataobject  );
    // }
    //
    // let options = {
    //   fieldSeparator: ',',
    //   quoteStrings: '"',
    //   decimalseparator: '.',
    //   showLabels: true,
    //   showTitle: false
    // };
    //
    // new Angular2Csv(data, 'My Report', options);
  }

  // invoke a default browser print function
  browserPrint(){
    window.print();
  }

  // load a preview function
  default_selected_periods: any = [];
  loadPreview($event){
    this.selected_indicator = [];
    // prepare indicators
    if($event.period == null){
      this.default_selected_periods = this.selected_periods;
    }else{
      this.default_selected_periods = [$event.period];
    }
    if($event.holderGroup == null){
      this.selected_indicator = [$event.indicator];
    }else{
      for( let holderid of $event.holderGroup.indicator_holder_ids ){
        for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
          if( holder.holder_id == holderid ){
            this.selected_indicator.push(holder);
          }
        }
      }
    }

    //prepare organisation units
    if($event.ou == null){
      this.orgunit_for_model = this.orgunit_model;
    }else{
      // let node = this.orgtree.treeModel.getNodeById($event.ou);
      // this.orgunit_for_model = node.data;
    }
    this.show_details = true;
  }

  removeModel(){
    this.show_details = false;
  }

  // a function to prepare a list of indicators to pass into a table
  getIndicatorsList(scorecard): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        indicators.push(indicator);
      }
    }
    return indicators;
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  // help function to help on closing the indicator modal popup
  getDetails($event){
    this.show_details = $event
  }

  showOptions(){
    this.showAdditionalOptions = !this.showAdditionalOptions;
  }

  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowAverage(orgunit_id){
    let sum = 0;
    let counter = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1) {
          counter++;
          sum = sum + parseFloat(indicator.values[orgunit_id]);
        }
      }
    }
    return (sum / counter).toFixed(2);
  }
  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowTotalAverage(orgunits){
    let sum = 0;
    let n = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1 ){
          for ( let orgunit of orgunits ){
            if(orgunit.id in indicator.values && indicator.values[orgunit.id] != null){
              n++;
              sum = sum + parseFloat(indicator.values[orgunit.id])
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
  findRowTotalSum(orgunits){
    let sum = 0;
    let n = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1 ){
          for ( let orgunit of orgunits ){
            if(orgunit.id in indicator.values && indicator.values[orgunit.id] != null){
              n++;
              sum = sum + parseFloat(indicator.values[orgunit.id])
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
  findColumnAverage(orgunits, indicator_id,scorecard){
    let sum = 0;
    for ( let orgunit of orgunits ){
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(orgunit.id in indicator.values && indicator.id == indicator_id){
            sum = sum + parseFloat(indicator.values[orgunit.id])
          }
        }
      }
    }
    return (sum/ this.getIndicatorsList(this.scorecard).length).toFixed(2);
  }

  /**
   * Finding avarage for the column
   * @param orgunits, indicator_id
   */
  findColumnSum(orgunits, indicator_id, scorecard){
    let sum = 0;
    for ( let orgunit of orgunits ){
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(orgunit.id in indicator.values && indicator.id == indicator_id){
            sum = sum + parseFloat(indicator.values[orgunit.id])
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
  findRowSum(orgunit_id){
    let sum = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if(orgunit_id in indicator.values && indicator.values[orgunit_id] != null ){
          if( this.hidenColums.indexOf(indicator.id) == -1) {
            sum = sum + parseFloat(indicator.values[orgunit_id])
          }
        }
      }
    }
    return sum;
  }

  // dealing with showing sum
  enableLegend(e){
    this.scorecard.data.header.show_legend_definition = e.target.checked;
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  // dealing with showing average
  showAverageInRow(e){
    this.show_average_in_row = e.target.checked;
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  // dealing with showing average
  showAverageInColumn(e){
    this.show_average_in_column = e.target.checked;
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  // dealing with showing average
  hideEmptyColumn(e){
    this.hide_empty_column = e.target.checked;
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  // hiding columns
  hideColums(){
    console.log(this.hidenColums);
  }

  sortScoreCard(sortingColumn, sortAscending){
    if( sortingColumn == "none" ){
      this.dataService.sortArrOfObjectsByParam(this.orgunits, "name", sortAscending)
    }
    else if( sortingColumn == 'avg' ){
      for ( let orgunit of this.orgunits ){
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id));
      }
      this.dataService.sortArrOfObjectsByParam(this.orgunits, sortingColumn, sortAscending)
    }
    else if( sortingColumn == 'sum' ){
      for ( let orgunit of this.orgunits ){
        orgunit['sum'] = this.findRowSum(orgunit.id);
      }
      this.dataService.sortArrOfObjectsByParam(this.orgunits, sortingColumn, sortAscending)
    }
    else{
      for ( let orgunit of this.orgunits ){
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn );
      }
      this.dataService.sortArrOfObjectsByParam(this.orgunits, sortingColumn, sortAscending)
    }
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  private findOrgunitIndicatorValue(orgunit_id: string, indicator_id:string){
    let val:number = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if(orgunit_id in indicator.values && indicator.values[orgunit_id] != null && indicator.id == indicator_id){
          val = parseFloat(indicator.values[orgunit_id])
        }
      }
    }
    return val;
  }

  ngOnDestroy (){
    if( this.subscription ){
      this.subscription.unsubscribe();
    }

    for( let subscr of this.indicatorCalls ){
      if( subscr ){
        subscr.unsubscribe();
      }
    }
  }

}
