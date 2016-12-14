import { Component, OnInit } from '@angular/core';
import {Http} from "@angular/http";
import {ScoreCard, ScorecardService} from "../shared/services/scorecard.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {DataService} from "../shared/data.service";

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  private subscription: Subscription;
  scorecard: ScoreCard;
  scorecardId: string;
  orgUnit: string = "m0frOspS7JY";
  period: string = "2016Q1";
  lastPeriod: string = "2015Q4";
  loading_message:string = "";
  orgunits: any[] = [];
  proccessed_percent = 0;
  loading: boolean = true;
  searchQuery: string = null;
  constructor(private scorecardService: ScorecardService,
              private dataService: DataService,
              private activatedRouter: ActivatedRoute) {
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        this.scorecardId = params['scorecardid'];
        this.scorecard = this.getEmptyScoreCard();
      });

  }

  ngOnInit() {
    this.loading_message = "loading scorecard details";
    this.scorecardService.load(this.scorecardId).subscribe(
      scorecard_details => {
        this.scorecard = {
          id: this.scorecardId,
          data: scorecard_details
        };

        let proccesed_indicators = 0;
        let indicator_list = this.getIndicatorList(this.scorecard);
        for( let holder of this.scorecard.data.data_settings.indicator_holders ){
          for( let indicator of holder.indicators ){
            indicator['values'] = [];
            indicator['showTopArrow'] = [];
            indicator['showBottomArrow'] = [];
            this.dataService.getIndicatorsRequest(this.orgUnit,this.period, indicator.id)
              .subscribe(
                (data) => {
                  this.loading_message = " Getting data for "+indicator.title;
                  proccesed_indicators++;
                  this.proccessed_percent = (proccesed_indicators / indicator_list.length) * 100;
                  if(proccesed_indicators == indicator_list.length ){
                    this.loading = false;
                  }
                  //noinspection TypeScriptUnresolvedVariable
                  for ( let orgunit of data.metaData.ou ){
                    if(!this.checkOrgunitAvailability(orgunit,this.orgunits)){
                      //noinspection TypeScriptUnresolvedVariable
                      this.orgunits.push({"id":orgunit, "name":data.metaData.names[orgunit]})
                    }

                    indicator.values[orgunit] = this.dataService.getIndicatorData(orgunit, data);

                  }
                  this.dataService.getIndicatorsRequest(this.orgUnit,this.lastPeriod, indicator.id)
                    .subscribe(
                      (oldData) => {
                        //noinspection TypeScriptUnresolvedVariable
                        for ( let orgunit of oldData.metaData.ou ){
                          let oldvalue = this.dataService.getIndicatorData(orgunit, oldData);
                          if( (oldvalue - indicator.values[orgunit]) > indicator.arrow_settings.effective_gap){
                            indicator.showBottomArrow[orgunit] = true;
                          }
                          if( ( indicator.values[orgunit] - oldvalue ) > indicator.arrow_settings.effective_gap){
                            indicator.showTopArrow[orgunit] = true;
                          }
                        }

                      }
                    )
                },
                error => {

                }
              )
          }
        }


      })
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

  getIndicatorList(scorecard): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        indicators.push(indicator.id);
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

  // Define default scorecard sample
  getEmptyScoreCard():ScoreCard{
    return {
      id: this.scorecardId,
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


}
