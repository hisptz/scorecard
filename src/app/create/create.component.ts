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
  total_group: number = 0;
  done_loading_groups: boolean = false;
  error_loading_groups: any = {occurred:false, message: ""};
  scorecard: ScoreCard;
  constructor(private http: Http,
              private indicatorService: IndicatorGroupService,
              private datasetService: DatasetService,
              private dataElementService: DataElementGroupService)
  {
    this.indicatorGroups = [];
    this.dataElementGroups = [];
    this.datasets = [];
    this.current_groups = [];

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
        this.total_group = this.current_groups.length;
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
