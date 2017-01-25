import {
  Component, OnInit, AfterViewInit, ViewChild, ValueProvider, style, state, animate, transition, trigger,
  OnDestroy
} from '@angular/core';
import {Http} from "@angular/http";
import {ScoreCard, ScorecardService} from "../shared/services/scorecard.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {DataService} from "../shared/data.service";
import {FilterService} from "../shared/services/filter.service";
import {Constants} from "../shared/costants";
import {OrgUnitService} from "../shared/services/org-unit.service";
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {Angular2Csv} from "angular2-csv";
import {forEach} from "@angular/router/src/utils/collection";
import Key = webdriver.Key;
import {isUndefined} from "util";
import {initDomAdapter} from "@angular/platform-browser/src/browser";

const actionMapping:IActionMapping = {
  mouse: {
    click: (node, tree, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
    }
  }
};

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
  private indicatorCalls: Subscription[] = []
  scorecard: ScoreCard;
  scorecardId: string;
  orgUnit: any = {};
  period: any = {};
  lastPeriod: string = "2015Q4";
  loading_message:string = "";
  orgunits: any[] = [];
  proccessed_percent = 0;
  loading: boolean = true;
  searchQuery: string = "";
  searchQuery1: string = "";
  searchQuery2: string = "";
  tree_orgunits: any[] = [];
  orgunit_levels: any = 1;
  base_url: string;
  orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: "Select Organisation Unit"
  };

  period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: true,
    placeholder: "Select period"
  };
  organisationunits: any[] = [];
  periods: any[] = [];
  selected_orgunits: any[] = [];
  selected_periods:any[] = [];
  period_type: string = "Quarterly";
  year: number = 2016;
  default_orgUnit: string[] = [];
  default_period: string[] = [];
  showOrgTree:boolean = true;
  showPerTree:boolean = true;
  showAdditionalOptions:boolean = true;

  show_details:boolean = false;

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('pertree')
  pertree: TreeComponent;

  selected_indicator: any = [];
  orgunit_for_model:any = [];
  period_for_model: any = [];

  opened_unit: string = null;
  opened_subunit: string = null;

  keep_options_open:boolean = true;

  show_sum_in_row: boolean = false;
  show_sum_in_column: boolean = false;
  show_average_in_row: boolean = false;
  show_average_in_column: boolean = false;

  sortAscending: boolean = true;
  sorting_column: any = "none";
  sub_sorting_column: string = 'none';
  grand_sorting_column: string = 'none';
  showLegend:boolean = false;
  hidenColums: any[] = [];

  shown_records:number = 0;
  show_rank: boolean = false;

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
        this.scorecard = this.getEmptyScoreCard();
      });
    this.periods = this.filterService.getPeriodArray( this.period_type, this.year );
    this.period = {
      id:this.filterService.getPeriodArray( this.period_type, this.year )[0].id,
      name:this.filterService.getPeriodArray( this.period_type, this.year )[0].name
    };

  }

  pushPeriodForward(){
    this.year += 1;
    this.periods = this.filterService.getPeriodArray(this.period_type,this.year);
  }

  pushPeriodBackward(){
    this.year -= 1;
    this.periods = this.filterService.getPeriodArray(this.period_type,this.year);
  }

  changePeriodType(){
    this.periods = this.filterService.getPeriodArray(this.period_type,this.year);
  }
  ngOnInit() {
    //loading organisation units

    this.periods = this.filterService.getPeriodArray( this.period_type, this.year );
    this.orgunit_tree_config.loading = true;
    if (this.orgunitService.nodes == null){
      this.subscription = this.orgunitService.getOrgunitLevelsInformation()
        .subscribe(
          (data: any) => {
            this.filterService.getInitialOrgunitsForTree().subscribe(
              (initial_data) => {
                this.orgUnit = {
                  id:initial_data.organisationUnits[0].id,
                  name: initial_data.organisationUnits[0].name,
                  children: initial_data.organisationUnits[0].children
                };
                this.loadScoreCard();
                this.organisationunits = initial_data.organisationUnits;
                let fields = this.orgunitService.generateUrlBasedOnLevels( data.pager.total);
                this.orgunitService.getAllOrgunitsForTree( fields )
                  .subscribe(
                    (orgUnits: any) => {
                      this.organisationunits = orgUnits.organisationUnits;
                      this.orgunitService.nodes = orgUnits.organisationUnits;
                      this.prepareOrganisationUnitTree(this.organisationunits,'parent');
                      this.activateNode(this.orgUnit.id, this.orgtree);
                      this.orgunit_tree_config.loading = false;
                    },
                    error => {
                      console.log('something went wrong while fetching Organisation units');
                      this.orgunit_tree_config.loading = false;
                    }
                  );
              });
          },
          error => {
            console.log('something went wrong while fetching Orga/////tion units ');
            this.orgunit_tree_config.loading = false;
          }
        );
    }
    else{
      this.orgunit_tree_config.loading = false;
      this.default_orgUnit = [this.orgunitService.nodes[0].id];
      this.orgUnit = {
        id:this.orgunitService.nodes[0].id,
        name: this.orgunitService.nodes[0].name,
        children: this.orgunitService.nodes[0].children
      };

      this.organisationunits = this.orgunitService.nodes;
      this.activateNode(this.orgUnit.id, this.orgtree);
      this.prepareOrganisationUnitTree(this.organisationunits,'parent');
      // TODO: make a sort level information dynamic
      this.loadScoreCard();
    }

  }

  ngAfterViewInit(){
    this.activateNode(this.period.id, this.pertree);
  }

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
      console.log("Org Units",organisationUnit)
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

  // a function to prepare a list of organisation units for analytics
  getOrgUnitsForAnalytics(selectedOrgunits): string{
    let orgUnits = [];
    orgUnits.push(selectedOrgunits.id);
    for( let orgunit of selectedOrgunits.children ){
      orgUnits.push(orgunit.id);
    }
    return orgUnits.join(";");
  }

  // a function that will be used to load scorecard
  indicator_loading: boolean[] = [];
  indicator_done_loading: boolean[] = [];
  old_proccessed_percent = 0;
  proccesed_indicators = 0;
  loadScoreCard( orgunit: any = null ){
    this.indicator_done_loading = [];
    this.proccessed_percent = 0;
    this.loading = true;
    this.orgunits = [];
    this.showOrgTree = true;
    this.showPerTree = true;
    this.loading_message = " Getting scorecard details ";
    this.scorecardService.load(this.scorecardId).subscribe(
      scorecard_details => {
        this.scorecard = {
          id: this.scorecardId,
          name: scorecard_details.header.title,
          data: scorecard_details
        };

        this.proccesed_indicators = 0;
        let old_proccesed_indicators = 0;
        let use_period = this.period.id+";"+this.filterService.getLastPeriod(this.period.id,this.period_type);
        let indicator_list = this.getIndicatorList(this.scorecard);
        for( let holder of this.scorecard.data.data_settings.indicator_holders ){
          for( let indicator of holder.indicators ){
            indicator['values'] = [];
            indicator['tooltip'] = [];
            indicator['previous_values'] = [];
            indicator['loading'] = true;
            indicator['showTopArrow'] = [];
            indicator['showBottomArrow'] = [];
            this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgUnit),this.period.id, indicator.id)
              .subscribe(
                (data) => {
                  indicator.loading = false;
                  this.loading_message = " Done Fetching data for "+indicator.title;
                  this.proccesed_indicators++;
                  this.proccessed_percent = (this.proccesed_indicators / indicator_list.length) * 100;
                  if(this.proccesed_indicators == indicator_list.length ){
                    this.loading = false;
                  }
                  //noinspection TypeScriptUnresolvedVariable
                  for ( let orgunit of data.metaData.ou ){
                    if(!this.checkOrgunitAvailability(orgunit,this.orgunits)){
                      //noinspection TypeScriptUnresolvedVariable
                      this.orgunits.push({"id":orgunit,
                        "name":data.metaData.names[orgunit],
                        "is_parent":this.orgUnit.id == orgunit
                      })
                    }
                    indicator.values[orgunit] = this.dataService.getIndicatorData(orgunit,this.period.id, data);
                  }
                  this.shown_records = this.orgunits.length;
                  this.indicator_loading[indicator.id] = true;
                  //load previous data
                  let effective_gap = parseInt( indicator.arrow_settings.effective_gap );
                  this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgUnit),this.filterService.getLastPeriod(this.period.id,this.period_type), indicator.id)
                    .subscribe(
                      ( olddata ) => {
                        for( let prev_orgunit of this.orgunits ){
                          indicator.previous_values[prev_orgunit.id] = this.dataService.getIndicatorData(prev_orgunit.id,this.filterService.getLastPeriod(this.period.id,this.period_type), olddata);
                        }
                        if(indicator.hasOwnProperty("arrow_settings")){
                          for( let key in indicator.values ) {
                            if(parseInt(indicator.previous_values[key]) != 0){
                              let check = parseInt( indicator.values[key] ) > (parseInt( indicator.previous_values[key] ) + effective_gap );
                              let check1 = parseInt( indicator.values[key] ) < (parseInt( indicator.previous_values[key] ) - effective_gap );
                              indicator.showTopArrow[key] = check;
                              indicator.showBottomArrow[key] = check1;
                              //noinspection TypeScriptUnresolvedVariable
                              if(indicator.showTopArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(key)){
                                let  rise = indicator.values[key] - parseInt( indicator.previous_values[key]);
                                //noinspection TypeScriptUnresolvedVariable
                                indicator.tooltip[key] = indicator.title +" has raised by "+rise.toFixed(2)+" from "+this.getPeriodName(this.period.id)+ " for "+ data.metaData.names[key]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                              }//noinspection TypeScriptUnresolvedVariable
                              if(indicator.showBottomArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(key)){
                                let  rise = parseFloat( indicator.previous_values[key] ) - indicator.values[key];
                                //noinspection TypeScriptUnresolvedVariable
                                indicator.tooltip[key] = indicator.title +" has decreased by "+rise.toFixed(2)+" from "+this.getPeriodName(this.period.id)+ " for "+ data.metaData.names[key]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                              }
                            }
                          }
                        }
                        this.indicator_loading[indicator.id] = false;
                        this.indicator_done_loading[indicator.id] = true;
                        old_proccesed_indicators++;
                        this.old_proccessed_percent = (old_proccesed_indicators / indicator_list.length) * 100;

                      })
                  )},
                error => {

                }
              ))
          }
        }
      });
  }

  // loading sub orgunit details
  showSubScorecard: any[] = [];
  subScoreCard: any = {};
  children_proccesed_indicators = 0;
  loadChildrenData(selectedorgunit){
    if( selectedorgunit.is_parent || this.showSubScorecard[selectedorgunit.id]){
      this.showSubScorecard = [];
      this.opened_unit = null;
    }else{
      this.opened_unit = selectedorgunit.id;
      this.showSubScorecard = [];
      this.subScoreCard.proccessed_percent = 0;
      this.subScoreCard.loading = true;
      this.subScoreCard.orgunits = [];
      this.subScoreCard.old_proccessed_percent = 0;
      this.subScoreCard.indicator_loading = [];
      this.subScoreCard.indicator_done_loading = [];
      this.showOrgTree = true;
      this.showPerTree = true;
      this.subScoreCard.loading_message = " Getting scorecard details ";
      this.showSubScorecard[selectedorgunit.id] = true;
      this.children_proccesed_indicators = 0;
      let old_proccesed_indicators = 0;
      let orgunit_with_children = this.orgtree.treeModel.getNodeById(selectedorgunit.id);
      let indicator_list = this.getIndicatorList(this.scorecard);
      for( let holder of this.scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          // indicator['values'] = [];
          indicator['loading'] = true;
          // indicator['showTopArrow'] = [];
          // indicator['showBottomArrow'] = [];
          this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(orgunit_with_children.data),this.period.id, indicator.id)
            .subscribe(
              (data) => {
                indicator.loading = false;
                this.subScoreCard.loading_message = " Done Fetching data for "+indicator.title;
                this.children_proccesed_indicators++;
                this.subScoreCard.proccessed_percent = (this.children_proccesed_indicators / indicator_list.length) * 100;
                if(this.children_proccesed_indicators == indicator_list.length ){
                  this.subScoreCard.loading = false;
                }
                //noinspection TypeScriptUnresolvedVariable
                for ( let orgunit of data.metaData.ou ){
                  if(!this.checkOrgunitAvailability(orgunit,this.subScoreCard.orgunits)){
                    //noinspection TypeScriptUnresolvedVariable
                    this.subScoreCard.orgunits.push({"id":orgunit,
                      "name":data.metaData.names[orgunit],
                      "is_parent":orgunit_with_children.data.id == orgunit
                    })
                  }
                  indicator.values[orgunit] = this.dataService.getIndicatorData(orgunit,this.period.id, data);
                }

                //load previous data
                this.subScoreCard.indicator_loading[indicator.id] = true;
                let effective_gap = parseInt( indicator.arrow_settings.effective_gap );
                this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(orgunit_with_children.data),this.filterService.getLastPeriod(this.period.id,this.period_type), indicator.id)
                  .subscribe(
                    ( olddata ) => {
                      for( let prev_orgunit of this.subScoreCard.orgunits ){
                        indicator.previous_values[prev_orgunit.id] = this.dataService.getIndicatorData(prev_orgunit.id,this.filterService.getLastPeriod(this.period.id,this.period_type), olddata);
                      }
                      if(indicator.hasOwnProperty("arrow_settings")){
                        for( let key in indicator.values ) {
                          if(parseInt(indicator.previous_values[key]) != 0){
                            let check = parseInt( indicator.values[key] ) > ( parseInt( indicator.previous_values[key] ) + effective_gap );
                            let check1 = parseInt( indicator.values[key] ) < ( parseInt( indicator.previous_values[key] ) - effective_gap );
                            indicator.showTopArrow[key] = check;
                            indicator.showBottomArrow[key] = check1;
                            //noinspection TypeScriptUnresolvedVariable
                            if(indicator.showTopArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(key)){
                              let  rise = indicator.values[key] - parseInt( indicator.previous_values[key]);
                              //noinspection TypeScriptUnresolvedVariable
                              indicator.tooltip[key] = indicator.title +" has raised by "+rise.toFixed(2)+" from "+this.getPeriodName(this.period.id)+ " for "+ data.metaData.names[key]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                            }//noinspection TypeScriptUnresolvedVariable
                            if(indicator.showBottomArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(key)){
                              let  rise = parseFloat( indicator.previous_values[key] ) - indicator.values[key];
                              //noinspection TypeScriptUnresolvedVariable
                              indicator.tooltip[key] = indicator.title +" has decreased by "+rise.toFixed(2)+" from "+this.getPeriodName(this.period.id)+ " for "+ data.metaData.names[key]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                            }
                          }
                        }
                      }
                      this.subScoreCard.indicator_loading[indicator.id] = false;
                      this.subScoreCard.indicator_done_loading[indicator.id] = true;
                      old_proccesed_indicators++;
                      this.subScoreCard.old_proccessed_percent = (old_proccesed_indicators / indicator_list.length) * 100;

                    }
                  )
                )
              },
              error => {

              }
            ))
        }
      }

    }

  }

  closeSubUnit(){
    this.showSubScorecard = [];
  }

  // loading sub orgunit details
  showChildrenSubScorecard: any[] = [];
  childrenSubScoreCard: any = {};
  grand_proccesed_indicators = 0;
  loadGrandChildrenData(selectedorgunit){
    if( selectedorgunit.is_parent || this.showChildrenSubScorecard[selectedorgunit.id] ){
      this.showChildrenSubScorecard = [];
      this.opened_subunit = null;
    }else{
      this.opened_subunit = selectedorgunit.id;
      this.showChildrenSubScorecard = [];
      this.childrenSubScoreCard.proccessed_percent = 0;
      this.childrenSubScoreCard.loading = true;
      this.childrenSubScoreCard.orgunits = [];
      this.childrenSubScoreCard.old_proccessed_percent = 0;
      this.childrenSubScoreCard.indicator_loading = [];
      this.childrenSubScoreCard.indicator_done_loading = [];
      this.showOrgTree = true;
      this.showPerTree = true;
      this.childrenSubScoreCard.loading_message = " Getting scorecard details ";
      this.showChildrenSubScorecard[selectedorgunit.id] = true;
      this.grand_proccesed_indicators = 0;
      let old_proccesed_indicators = 0;
      let orgunit_with_children = this.orgtree.treeModel.getNodeById(selectedorgunit.id);
      let indicator_list = this.getIndicatorList(this.scorecard);
      for( let holder of this.scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          // indicator['values'] = [];
          indicator['loading'] = true;
          // indicator['showTopArrow'] = [];
          // indicator['showBottomArrow'] = [];
          this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(orgunit_with_children.data),this.period.id, indicator.id)
            .subscribe(
              (data) => {
                indicator.loading = false;
                this.childrenSubScoreCard.loading_message = " Done Fetching data for "+indicator.title;
                this.grand_proccesed_indicators++;
                this.childrenSubScoreCard.proccessed_percent = (this.grand_proccesed_indicators / indicator_list.length) * 100;
                if(this.grand_proccesed_indicators == indicator_list.length ){
                  this.childrenSubScoreCard.loading = false;
                }
                //noinspection TypeScriptUnresolvedVariable
                for ( let orgunit of data.metaData.ou ){
                  if(!this.checkOrgunitAvailability(orgunit,this.childrenSubScoreCard.orgunits)){
                    //noinspection TypeScriptUnresolvedVariable
                    this.childrenSubScoreCard.orgunits.push({"id":orgunit,
                      "name":data.metaData.names[orgunit],
                      "is_parent":orgunit_with_children.data.id == orgunit
                    })
                  }
                  indicator.values[orgunit] = this.dataService.getIndicatorData(orgunit,this.period.id, data);
                }

                //load previous data
                this.childrenSubScoreCard.indicator_loading[indicator.id] = true;
                let effective_gap = parseInt( indicator.arrow_settings.effective_gap );
                this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(orgunit_with_children.data),this.filterService.getLastPeriod(this.period.id,this.period_type), indicator.id)
                  .subscribe(
                    ( olddata ) => {
                      for( let prev_orgunit of this.childrenSubScoreCard.orgunits ){
                        indicator.previous_values[prev_orgunit.id] = this.dataService.getIndicatorData(prev_orgunit.id,this.filterService.getLastPeriod(this.period.id,this.period_type), olddata);
                      }
                      if(indicator.hasOwnProperty("arrow_settings")){
                        for( let key in indicator.values ) {
                          if(parseInt(indicator.previous_values[key]) != 0){
                            let check = parseInt( indicator.values[key] ) > ( parseInt( indicator.previous_values[key] ) + effective_gap );
                            let check1 = parseInt( indicator.values[key] ) < ( parseInt( indicator.previous_values[key] ) - effective_gap );
                            indicator.showTopArrow[key] = check;
                            indicator.showBottomArrow[key] = check1;
                            //noinspection TypeScriptUnresolvedVariable
                            if(indicator.showTopArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(key)){
                              let  rise = indicator.values[key] - parseInt( indicator.previous_values[key]);
                              //noinspection TypeScriptUnresolvedVariable
                              indicator.tooltip[key] = indicator.title +" has raised by "+rise.toFixed(2)+" from "+this.getPeriodName(this.period.id)+ " for "+ data.metaData.names[key]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                            }//noinspection TypeScriptUnresolvedVariable
                            if(indicator.showBottomArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(key)){
                              let  rise = parseFloat( indicator.previous_values[key] ) - indicator.values[key];
                              //noinspection TypeScriptUnresolvedVariable
                              indicator.tooltip[key] = indicator.title +" has decreased by "+rise.toFixed(2)+" from "+this.getPeriodName(this.period.id)+ " for "+ data.metaData.names[key]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                            }
                          }
                        }
                      }
                      this.childrenSubScoreCard.indicator_loading[indicator.id] = false;
                      this.childrenSubScoreCard.indicator_done_loading[indicator.id] = true;
                      old_proccesed_indicators++;
                      this.childrenSubScoreCard.old_proccessed_percent = (old_proccesed_indicators / indicator_list.length) * 100;

                    }
                  )
                )
              },
              error => {

              }
            ))
        }
      }
    }

  }

  getPeriodName(id){
    for ( let period of this.filterService.getPeriodArray(this.period_type, this.filterService.getLastPeriod(id,this.period_type).substr(0,4))){
      if( this.filterService.getLastPeriod(id,this.period_type) == period.id){
        return period.name;
      }
    }
  }

  //setting the period to next or previous
  setPeriod(type){
    if(type == "down"){
      this.periods = this.filterService.getPeriodArray(this.period_type, this.filterService.getLastPeriod(this.period.id,this.period_type).substr(0,4));
      this.activateNode(this.filterService.getLastPeriod(this.period.id,this.period_type), this.pertree);
      this.period = {
        id:this.filterService.getLastPeriod(this.period.id,this.period_type),
        name:this.getPeriodName(this.filterService.getLastPeriod(this.period.id,this.period_type))
      };
    }
    if(type == "up"){
      this.periods = this.filterService.getPeriodArray(this.period_type, this.filterService.getNextPeriod(this.period.id,this.period_type).substr(0,4));
      this.activateNode(this.filterService.getNextPeriod(this.period.id,this.period_type), this.pertree);
      this.period = {
        id:this.filterService.getNextPeriod(this.period.id,this.period_type),
        name:this.getPeriodName(this.filterService.getNextPeriod(this.period.id,this.period_type))
      };
    }
    this.loadScoreCard();
  }

  // prepare a proper tooltip to display to counter multiple indicators in the same td
  prepareTooltip(holder,orgunit): string{
    let tooltip = [];
    for (let indicator of holder.indicators ){
      if(indicator.tooltip[orgunit]){
        tooltip.push(indicator.tooltip[orgunit])
      }
    }
    return tooltip.join(", ");
  }

  // prepare scorecard data and download them as csv
  downloadCSV(orgunitId){
    let data = [];
    let use_orgunit = this.orgtree.treeModel.getNodeById(orgunitId)
    for ( let current_orgunit of use_orgunit.data.children ){
      let dataobject = {};
      dataobject['orgunit'] = current_orgunit.name;
      for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          dataobject[indicator.title] = indicator.values[current_orgunit.id];
        }
      }
      data.push( dataobject  );
    }

    let options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular2Csv(data, 'My Report', options);
  }

  // invoke a default browser print function
  browserPrint(){
    window.print();
  }

  // load a preview function
  loadPreview(holderGroup,indicator, ou){
    this.selected_indicator = [];
    // prepare indicators
    if(holderGroup == null){
      this.selected_indicator = [indicator];
    }else{
      for( let holderid of holderGroup.indicator_holder_ids ){
        for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
          if( holder.holder_id == holderid ){
            this.selected_indicator.push(holder);
          }
        }
      }
    }

    //prepare organisation units
    if(ou == null){
      this.orgunit_for_model = this.orgUnit;
    }else{
      let node = this.orgtree.treeModel.getNodeById(ou);
      this.orgunit_for_model = node.data;
    }
    this.show_details = true;
  }

  removeModel(){
    this.show_details = false;
  }


  checkOrgunitAvailability(id, array){
    let check = false;
    for( let orgunit of array ){
      if(orgunit.id == id){
        check = true;
      }
    }
    return check;
  }

  // a function to prepare a list of indicators to pass into a table
  getIndicatorList(scorecard): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        indicators.push(indicator.id);
      }
    }
    return indicators;
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

  // A function used to decouple indicator list and prepare them for a display
  getItemsFromGroups(): any[]{
    let indicators_list = [];
    for(let data of this.scorecard.data.data_settings.indicator_holder_groups ){
      for( let holders_list of data.indicator_holder_ids ){
        for( let holder of this.scorecard.data.data_settings.indicator_holders ){
          if(holder.holder_id == holders_list){
            // check if indicators in a card are hidden so don show them
            let hide_this: boolean = true;
            for ( let indicator of holder.indicators ){
              if( this.hidenColums.indexOf(indicator.id) == -1){
                hide_this = false;
              }
            }
            if( !hide_this ){ indicators_list.push(holder) }
          }
        }
      }
    }
    return indicators_list;
  }

  // simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string{
    var title = [];
    for( let data of holder.indicators ){
      if( this.hidenColums.indexOf(data.id) == -1 ){
        title.push(data.title)
      }
    }
    return title.join(' / ')
  }

  // assign a background color to area depending on the legend set details
  assignBgColor(object,value): string{
    var color = "#BBBBBB";
    for( let data of object.legendset ){
      if(data.max == "-"){

        if(parseInt(value) >= parseInt(data.min) ){
          color = data.color;
        }
      }else{
        if(parseInt(value) >= parseInt(data.min) && parseInt(value) <= parseInt(data.max)){
          color = data.color;
        }
      }
    };
    return color;
  }

  // Define default scorecard sample
  getEmptyScoreCard():ScoreCard{
    return {
      id: this.scorecardId,
      name:"",
      data: {
        "orgunit_settings": {
          "parent": "USER_ORGUNIT",
          "level": "LEVEL-2"
        },
        "show_score": false,
        "show_rank": false,
        "rank_position_last": true,
        "header": {
          "title": "",
          "sub_title":"",
          "description": "",
          "show_arrows_definition": true,
          "show_legend_definition": false,
          "template": {
            "display": false,
            "content": ""
          }
        },
        "legendset_definitions": [
          {
            "color": "#008000",
            "definition": "Target achieved / on track"
          },
          {
            "color": "#FFFF00",
            "definition": "Progress, but more effort required"
          },
          {
            "color": "#FF0000",
            "definition": "Not on track"
          },
          {
            "color": "#D3D3D3",
            "definition": "N/A"
          },
          {
            "color": "#FFFFFF",
            "definition": "No data"
          }
        ],
        "highlighted_indicators": {
          "display": false,
          "definitions": []
        },
        "data_settings": {
          "indicator_holders": [],
          "indicator_holder_groups": []
        },
        "additional_labels": [],
        "footer": {
          "display_generated_date": false,
          "display_title": false,
          "sub_title": null,
          "description": null,
          "template": null
        },
        "indicator_dataElement_reporting_rate_selection": "Indicators"
      }
    }
  }

  // custom settings for tree
  customTemplateStringOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

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
    // this.card_selected_orgunits.forEach((item,index) => {
    //   if( $event.node.data.id == item.id ) {
    //     this.card_selected_orgunits.splice(index, 1);
    //   }
    // });
  };

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivatePer ( $event ) {
    // this.card_selected_periods.forEach((item,index) => {
    //   if( $event.node.data.id == item.id ) {
    //     this.card_selected_periods.splice(index, 1);
    //   }
    // });
  };

  // add item to array of selected items when item is selected
  activateOrg = ($event) => {
    this.selected_orgunits = [$event.node.data];
    this.orgUnit = $event.node.data;
  };

  // add item to array of selected items when item is selected
  activatePer = ($event) => {
    this.selected_periods = [$event.node.data];
    this.period = $event.node.data;
  };

  activateNode(nodeId:any, nodes){
    setTimeout(() => {
      let node = nodes.treeModel.getNodeById(nodeId);
      if (node)
        node.toggleActivated();
    }, 0);
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  // help function to help on closing the indicator modal popup
  getDetails($event){
    this.show_details = $event
  }

  closechildrenSubUnit(){
    this.showChildrenSubScorecard = [];
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
  // dealing with showing sum
  enableRank(e){
    this.show_rank = e.target.checked;
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  // dealing with showing sum
  showSumInRow(e){
    this.show_sum_in_row = e.target.checked;
    let close = (this.keep_options_open)?'':this.showOptions();
  }

  // dealing with showing sum
  showSumInColumn(e){
    this.show_sum_in_column = e.target.checked;
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

  getCorrectColspan(){
    let i = 0;
    if(this.show_sum_in_row){
      i++;
    }
    if(this.show_average_in_row){
      i++;
    }if(this.show_rank){
      i++;
    }
    return i;
  }

  // hiding columns
  hideColums(){
    console.log(this.hidenColums);
  }

  //helper function to dynamical provide colspan attribute for a group
  getGroupColspan(group_holders){
    let colspan= 0;
    for (let holder of this.scorecard.data.data_settings.indicator_holders ){
      if(group_holders.indexOf(holder.holder_id) != -1){
        let hide_this: boolean = true;
        for ( let indicator of holder.indicators ){
          if( this.hidenColums.indexOf(indicator.id) == -1){
            hide_this = false;
          }
        }
        if( !hide_this ){ colspan++ }
      }
    }
    return colspan;
  }

  //get number of visible indicators from a holder
  getVisibleIndicators(holder){
    let indicators =  [];
    for ( let indicator of holder.indicators ){
      if( this.hidenColums.indexOf(indicator.id) == -1){
        indicators.push(indicator);
      }
    }
    return indicators;
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

  current_sorting = true;
  sortScoreCardFromColumn(sortingColumn, sortAscending, orguUnits, lower_level:boolean = true){
    this.current_sorting = !this.current_sorting;
    this.sorting_column = sortingColumn;
    sortAscending = this.current_sorting;
    if( sortingColumn == "none" ){
      this.dataService.sortArrOfObjectsByParam(orguUnits, "name", sortAscending)
    }
    else if( sortingColumn == 'avg' ){
      for ( let orgunit of orguUnits ){
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id));
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    else if( sortingColumn == 'sum' ){
      for ( let orgunit of orguUnits ){
        orgunit['sum'] = this.findRowSum(orgunit.id);
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    else{
      for ( let orgunit of orguUnits ){
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn );
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    let close = (this.keep_options_open)?'':this.showOptions();
    this.sorting_column = (lower_level)?'none':sortingColumn;
  }

  sortSubScoreCard(sortingColumn, sortAscending){
    if( sortingColumn == "none" ){
      this.dataService.sortArrOfObjectsByParam(this.subScoreCard.orgunit, "name", sortAscending)
    }
    else if( sortingColumn == 'avg' ){
      for ( let orgunit of this.subScoreCard.orgunits ){
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id));
      }
      this.dataService.sortArrOfObjectsByParam(this.subScoreCard.orgunits, sortingColumn, sortAscending)
    }
    else if( sortingColumn == 'sum' ){
      for ( let orgunit of this.subScoreCard.orgunits ){
        orgunit['sum'] = this.findRowSum(orgunit.id);
      }
      this.dataService.sortArrOfObjectsByParam(this.subScoreCard.orgunits, sortingColumn, sortAscending)
    }
    else{
      for ( let orgunit of this.subScoreCard.orgunits ){
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn );
      }
      this.dataService.sortArrOfObjectsByParam(this.subScoreCard.orgunits, sortingColumn, sortAscending)
    }
  }

  sortGrandScoreCard(sortingColumn, sortAscending){
    if( sortingColumn == "none" ){
      this.dataService.sortArrOfObjectsByParam(this.childrenSubScoreCard.orgunits, "name", sortAscending)
    }
    else if( sortingColumn == 'avg' ){
      for ( let orgunit of this.childrenSubScoreCard.orgunits ){
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id));
      }
      this.dataService.sortArrOfObjectsByParam(this.childrenSubScoreCard.orgunits, sortingColumn, sortAscending)
    }
    else if( sortingColumn == 'sum' ){
      for ( let orgunit of this.childrenSubScoreCard.orgunits ){
        orgunit['sum'] = this.findRowSum(orgunit.id);
      }
      this.dataService.sortArrOfObjectsByParam(this.childrenSubScoreCard.orgunit, sortingColumn, sortAscending)
    }
    else{
      for ( let orgunit of this.childrenSubScoreCard.orgunits ){
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn );
      }
      this.dataService.sortArrOfObjectsByParam(this.childrenSubScoreCard.orgunits, sortingColumn, sortAscending)
    }
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

  // helper function to set label value( helpful when there is more than one indicator)
  getIndicatorLabel(indicator, label){
    let labels = [];
    for( let data of indicator.indicators ){
      if(data.additional_label_values[label] != null && data.additional_label_values[label] != "" && this.hidenColums.indexOf(data.id) == -1){
        labels.push(data.additional_label_values[label])
      }
    }
    return labels.join(' / ')
  }

  getCursorStyle(orgunit){
    if(orgunit.is_parent){
      return "default"
    }else{
      return "pointer"
    }
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
