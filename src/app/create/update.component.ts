import { Component, OnInit } from '@angular/core';
import {Http} from "@angular/http";
import {IndicatorGroupService, IndicatorGroup} from "../shared/services/indicator-group.service";
import {DatasetService, Dataset} from "../shared/services/dataset.service";
import {DataElementGroupService, DataElementGroup} from "../shared/services/data-element-group.service";
import {ScoreCard, ScorecardService} from "../shared/services/scorecard.service";
import {Router, ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  // variable initializations
  datasets: Dataset[];
  indicatorGroups: IndicatorGroup[];
  dataElementGroups: DataElementGroup[];
  current_groups: any[];
  current_listing: any[];
  activeGroup: string = null;
  done_loading_groups: boolean = false;
  done_loading_list: boolean = false;
  error_loading_groups: any = {occurred:false, message: ""};
  error_loading_list: any = {occurred:false, message: ""};
  scorecard: ScoreCard;
  listReady:boolean = false;
  listQuery: string = null;
  groupQuery: string = null;
  need_for_group: boolean = false;
  need_for_indicator: boolean = false;
  current_group_id: number = 1;
  current_holder_group_id: number = 1;
  current_indicator_holder: any;
  current_holder_group: any;
  saving_scorecard: boolean = false;
  saving_error: boolean = false;
  private subscription: Subscription;
  constructor(private http: Http,
              private indicatorService: IndicatorGroupService,
              private datasetService: DatasetService,
              private dataElementService: DataElementGroupService,
              private router: Router,
              private scorecardService: ScorecardService,
              private activatedRouter: ActivatedRoute
  )
  {
    this.indicatorGroups = [];
    this.dataElementGroups = [];
    this.datasets = [];
    this.current_groups = [];
    this.current_listing = [];
    this.current_indicator_holder = {
      "holder_id": 1,
      "indicators": []
    };
    this.current_holder_group = {
      "id": 1,
      "name": "",
      "indicator_holder_ids": [],
      "background_color": "#ffffff",
      "holder_style": null
    };

    // initialize the scorecard with a uid
    this.scorecard = this.getEmptyScoreCard();
    this.subscription = activatedRouter.params.subscribe(
      (params: any) => {
        let id = params['scorecardid'];
        this.scorecardService.load(id).subscribe(
          scorecard_details => {
            this.scorecard = {
              id: id,
              data: scorecard_details
            };

          })
      });

    // this.getItemsFromGroups();
  }

  ngOnInit() {
    //get indicatorGroups
    this.indicatorService.loadAll().subscribe(
      indicatorGroups => {
        for ( let group of indicatorGroups.indicatorGroups ) {
          this.indicatorGroups.push({
            id: group.id,
            name: group.name,
            indicators: []
          });
        }
        this.current_groups = this.indicatorGroups;
        this.error_loading_groups.occurred = false;
        this.done_loading_groups = true;
      },
      error => {
        this.error_loading_groups.occurred = true;
        this.error_loading_groups.message = "There was an error when loading Indicator Groups";
      }
    );
    //get dataElementsGroups
    this.dataElementService.loadAll().subscribe(
      dataElementGroups => {
        for ( let group of dataElementGroups.dataElementGroups ) {
          this.dataElementGroups.push({
            id: group.id,
            name: group.name,
            dataElements: []
          });
        }
      },
      error => console.log("Something went wrong while trying to pull data Elements groups")
    );
    //get datasets
    this.datasetService.loadAll().subscribe(
      dataSets => {
        //noinspection TypeScriptUnresolvedVariable
        for ( let dataset of dataSets.dataSets ) {
          this.datasets.push({
            id: dataset.id,
            name: dataset.name,
            periodType: dataset.periodType
          });
        }
      },
      error => console.log("Something went wrong while trying to pull data Elements groups")
    );
  }

  // cancel scorecard creation process
  cancelCreate(){
    this.router.navigateByUrl('');
  }
  // deal with all issues during group type switching between dataelent, indicators and datasets
  switchType(current_type): void{
    this.listReady = false;
    this.groupQuery = null;
    if(current_type == "indicators"){
      this.current_groups = this.indicatorGroups;
    }else if(current_type == "dataElements"){
      this.current_groups = this.dataElementGroups;
    }else if(current_type == "Completeness"){
      this.current_groups = [];
      this.current_listing = this.datasets;
      this.listReady = true;
      this.done_loading_list = true;
      this.listQuery = null;
    }else if(current_type == "Timeliness"){
      this.current_groups = [];
      this.current_listing = this.datasets;
      this.listReady = true;
      this.done_loading_list = true;
      this.listQuery = null;
    }else{

    }
  }

  // load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_list(group_id,current_type): void{
    this.listQuery = null;
    this.activeGroup = group_id;
    console.log(this.scorecard);
    this.listReady = true;
    this.current_listing = [];
    this.done_loading_list = false;
    if( current_type == "indicators" ){
      let load_new = false;
      for ( let group  of this.indicatorGroups ){
        if ( group.id == group_id ){
          if (group.indicators.length != 0){
            this.current_listing = group.indicators;
            this.done_loading_list = true;
          }else{
            load_new = true;
          }
        }
      }
      if ( load_new ){
        this.indicatorService.load(group_id).subscribe(
          indicators => {
            this.current_listing = indicators.indicators;
            this.done_loading_list = true;
            for ( let group  of this.indicatorGroups ){
              if ( group.id == group_id ){
                group.indicators = indicators.indicators;
              }
            }
          },
          error => {
            this.error_loading_list.occurred = true;
            this.error_loading_list.message = "Something went wrong when trying to load Indicators";
          }
        )
      }

    }else if( current_type == "dataElements" ){
      let load_new = false;
      for ( let group  of this.dataElementGroups ){
        if ( group.id == group_id ){
          if (group.dataElements.length != 0){
            this.current_listing = group.dataElements;
            this.done_loading_list = true;
          }else{
            load_new = true;
          }
        }
      }
      if ( load_new ) {
        this.dataElementService.load(group_id).subscribe(
          dataElements => {
            this.current_listing = dataElements.dataElements;
            this.done_loading_list = true;
            for ( let group  of this.dataElementGroups ){
              if ( group.id == group_id ){
                group.dataElements = dataElements.dataElements;
              }
            }
          },
          error => {
            this.error_loading_list.occurred = true;
            this.error_loading_list.message = "Something went wrong when trying to load Indicators";
          }
        )
      }
    }else{

    }
  }

  // load a single item for use in a score card
  load_item(item): void{
    if(this.indicatorExist(this.scorecard.data.data_settings.indicator_holders,item)){
      alert("Selected indicator has already been added");
    }else{
      let indicator = this.getIndicatorStructure(item.name, item.id);
      this.current_indicator_holder.holder_id = this.current_group_id;
      if(this.current_indicator_holder.indicators.length < 2){
        indicator.value = Math.floor(Math.random() * 60) + 40;
        this.current_indicator_holder.indicators.push( indicator );
      }else{
        alert("There are two items already")
      }
      this.addIndicatorHolder(this.current_indicator_holder);
      this.current_holder_group.id = this.current_holder_group_id;
      this.addHolderGroups(this.current_holder_group, this.current_indicator_holder);
    }

  }

  // add an indicator holder to a scorecard
  addIndicatorHolder(indicator_holder): void{
    let add_new = true;
    console.log("id:",indicator_holder.holder_id);
    for( let holder of this.scorecard.data.data_settings.indicator_holders ){
      if (holder.holder_id == indicator_holder.holder_id){
        holder = indicator_holder;
        add_new = false;
      }
    }
    if(add_new){
      this.scorecard.data.data_settings.indicator_holders.push(indicator_holder);
    }
    console.log( this.scorecard.data.data_settings);
    this.need_for_indicator = true;
  }

  // add a group of holders to a scorecard
  addHolderGroups(holder_group,holder): void{
    let add_new = true;
    for( let group of this.scorecard.data.data_settings.indicator_holder_groups ){
      if (group.id == holder_group.id){
        if( group.indicator_holder_ids.indexOf(holder.holder_id) == -1 ){
          group.indicator_holder_ids.push(holder.holder_id);
        }
        add_new = false;
      }
    }
    if(add_new){
      if( holder_group.indicator_holder_ids.indexOf(holder.holder_id) == -1 ) holder_group.indicator_holder_ids.push(holder.holder_id);
      this.scorecard.data.data_settings.indicator_holder_groups.push(holder_group);
    }
  }

  // enable adding of new Indicator
  enableAddIndicator(): void{
    this.current_group_id = this.current_group_id + 1;
    this.current_indicator_holder = {
      "holder_id": this.current_group_id,
      "indicators": []
    };
    this.need_for_indicator = false;
    let deleted_id = null;
    this.scorecard.data.data_settings.indicator_holders.forEach((item, index) => {
      if(item.indicators.length == 0){
        deleted_id = item.holder_id;
        this.scorecard.data.data_settings.indicator_holders.splice(index,1);
      }
    });
    for (let group of this.scorecard.data.data_settings.indicator_holder_groups ){
      group.indicator_holder_ids.forEach((item, index) => {
        if(item == deleted_id){
          group.indicator_holder_ids.splice(index,1);
        }
      })
    }


    this.addIndicatorHolder(this.current_indicator_holder);
    this.current_holder_group.id = this.current_holder_group_id;
    this.addHolderGroups(this.current_holder_group, this.current_indicator_holder);
  }

  // this will enable updating of indicator
  updateIndicator(indicator:any): void{
    this.current_indicator_holder = indicator;
    this.need_for_indicator = true;
  }

  deleteIndicator(indicator): void{
    this.current_indicator_holder.indicators.forEach((item, index) => {
      if (item.id == indicator.id){
        this.current_indicator_holder.indicators.splice(index,1);
      }
    });
  }

  // generate a random list of Id for use as scorecard id
  makeid(): string{
    let text = "";
    let possible_combinations = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 11; i++ )
      text += possible_combinations.charAt(Math.floor(Math.random() * possible_combinations.length));
    return text;
  }

  // Define default scorecard sample
  getEmptyScoreCard():ScoreCard{
    return {
      id: this.makeid(),
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

  // define a default indicator structure
  getIndicatorStructure(name:string, id:string): any{
    return {
      "name": name,
      "id": id,
      "title": name,
      "high_is_good": true,
      "value": 0,
      "weight": 100,
      "legend_display": true,
      "legendset": [
        {
          "color": "#008000",
          "min": "80",
          "max": "-"
        },
        {
          "color": "#FFFF00",
          "min": "60",
          "max": "80"
        },
        {
          "color": "#FF0000",
          "min": "0",
          "max": "60"
        }
      ],
      "additional_label_values": [],
      "arrow_settings": {
        "effective_gap": 5,
        "display": true
      },
      "label_settings": {
        "display": true,
        "font_size": ""
      }
    }

  }

  // A function used to decouple indicator list and prepare them for a display
  getItemsFromGroups(): any[]{
    let indicators_list = [];
    for(let data of this.scorecard.data.data_settings.indicator_holder_groups ){
      for( let holders_list of data.indicator_holder_ids ){
        for( let holder of this.scorecard.data.data_settings.indicator_holders ){
          if(holder.holder_id == holders_list){
            indicators_list.push(holder)
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
      title.push(data.title)
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

  //check if the indicator is already added in a scorecard
  indicatorExist(holders,indicator): boolean {
    let check = false;
    for( let holder of holders ){
      for( let indicatorValue of holder.indicators ){
        if(indicatorValue.id == indicator.id){
          check = true;
        }
      }
    }
    return check;
  };

  // check if this is the current group
  is_current_group(group: any):boolean {
    let check = false;
    if(group.id == this.current_holder_group.id) {
      check = true;
    }
    return check;
  }

  is_current_indicator(indicator: any):boolean {
    let check = false;
    if ( indicator.holder_id == this.current_indicator_holder.holder_id ){
      check = true;
    }
    return check;
  }

  scorecardReady(): boolean{
    if(this.scorecard.data.data_settings.indicator_holders.length == 0 || this.scorecard.data.header.title == "" || this.scorecard.data.header.description == ""){
      return false;
    }else{
      return true
    }
  }

  saveScoreCard(): void {
    // delete all empty indicators if any
    let deleted_id = null;
    this.scorecard.data.data_settings.indicator_holders.forEach((item, index) => {
      if(item.indicators.length == 0){
        deleted_id = item.holder_id;
        this.scorecard.data.data_settings.indicator_holders.splice(index,1);
      }
    });
    for (let group of this.scorecard.data.data_settings.indicator_holder_groups ){
      group.indicator_holder_ids.forEach((item, index) => {
        if(item == deleted_id){
          group.indicator_holder_ids.splice(index,1);
        }
      })
    }

    // post the data
    this.saving_scorecard = true;
    this.scorecardService.create(this.scorecard).subscribe(
      (data) => {
        this.saving_scorecard = false;
        this.router.navigate(['view',this.scorecard.id]);
      },
      error => {
        this.saving_error = true;
        this.saving_scorecard = false
      }
    );
  }
}
