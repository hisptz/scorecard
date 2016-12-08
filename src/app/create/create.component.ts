import { Component, OnInit } from '@angular/core';
import {Http} from "@angular/http";
import {IndicatorGroupService, IndicatorGroup} from "../shared/services/indicator-group.service";
import {DatasetService, Dataset} from "../shared/services/dataset.service";
import {DataElementGroupService, DataElementGroup} from "../shared/services/data-element-group.service";
import {ScoreCard} from "../shared/services/scorecard.service";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  legends_definitions: any[];
  color: string = "#127bdc";
  datasets: Dataset[];
  indicatorGroups: IndicatorGroup[];
  dataElementGroups: DataElementGroup[];
  current_groups: any[];
  current_listing: any[];
  done_loading_groups: boolean = false;
  done_loading_list: boolean = false;
  error_loading_groups: any = {occurred:false, message: ""};
  error_loading_list: any = {occurred:false, message: ""};
  scorecard: ScoreCard;
  listReady:boolean = false;
  constructor(private http: Http,
              private indicatorService: IndicatorGroupService,
              private datasetService: DatasetService,
              private dataElementService: DataElementGroupService)
  {
    this.indicatorGroups = [];
    this.dataElementGroups = [];
    this.datasets = [];
    this.current_groups = [];
    this.current_listing = [];

    // initialize the scorecard with a uid
    this.scorecard = {
      id: this.makeid(),
      data: []
    };
    this.legends_definitions = [
      {
        color: "#0F7F11",
        definition: "Target achieved / on track"
      },
      {
        color: "#FFFD38",
        definition: "Progress, but more effort required"
      },
      {
        color: "#FD0C1C",
        definition: "Not on track"
      },
      {
        color: "#D3D3D3",
        definition: "N/A"
      },
      {
        color: "#FFFFFF",
        definition: "No data"
      }
    ];
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

  switchType(current_type): void{
    this.listReady = false;
    if(current_type == "indicators"){
      this.current_groups = this.indicatorGroups;
    }else if(current_type == "dataElements"){
      this.current_groups = this.dataElementGroups;
    }else if(current_type == "Completeness"){
      this.current_groups = [];
      this.current_listing = this.datasets;
      this.listReady = true;
      this.done_loading_list = true;
    }else if(current_type == "Timeliness"){
      this.current_groups = [];
      this.current_listing = this.datasets;
      this.listReady = true;
      this.done_loading_list = true;
    }else{

    }
  }

  // load items to be displayed in a list of indicators/ data Elements / Data Sets
  load_list(group_id,current_type): void{
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
  load_item(): void{

  }
  makeid(): string{
    let text = "";
    let possible_combinations = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 11; i++ )
      text += possible_combinations.charAt(Math.floor(Math.random() * possible_combinations.length));
    return text;
  }

  //////////////////////////////////////////////////////////////////////////////
  ////////////////////////Define default data sources//////////////////////////
  /////////////////////////////////////////////////////////////////////////////

}
