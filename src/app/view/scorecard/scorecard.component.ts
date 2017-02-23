import {Component, OnInit, Input, AfterViewInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {ScoreCard, ScorecardService} from "../../shared/services/scorecard.service";
import {Subscription} from "rxjs";
import {DataService} from "../../shared/data.service";
import {ActivatedRoute} from "@angular/router";
import {FilterService} from "../../shared/services/filter.service";
import {OrgUnitService} from "../../shared/services/org-unit.service";
import {Constants} from "../../shared/costants";
import {subscribeOn} from "rxjs/operator/subscribeOn";
import {TreeComponent} from "angular2-tree-component";

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;
  private indicatorCalls: Subscription[] = [];
  @Input() scorecard: ScoreCard;
  @Input() period: any = [];
  @Input() default_period: any = [];
  @Input() orgUnit: any;
  @Input() period_type: string;
  @Input() show_sum_in_row: boolean = false;
  @Input() show_sum_in_column: boolean = false;
  @Input() show_average_in_row: boolean = false;
  @Input() show_average_in_column: boolean = false;
  @Input() shown_records:number = 0;
  @Input() average_selection:string = "all";
  @Input() hidenColums: any[] = [];
  @Input() show_rank: boolean = false;
  @Input() sorting_column: any = "none";
  @Input() orgunit_model: any;
  @Input() orgtree: TreeComponent;
  @Input() level: string = "top";

  @Output() show_details = new EventEmitter<any>();

  searchQuery: string = "";
  orgunits: any[] = [];
  proccessed_percent = 0;
  loading: boolean = true;
  loading_message:string;
  base_url: string;
  showSubScorecard: any[] = [];
  periods_list: any = [];
  keep_options_open:boolean = true;
  constructor(
    private dataService: DataService,
    private filterService: FilterService,
    private costant: Constants,
  ) {
    this.base_url = this.costant.root_dir;

  }

  ngOnInit() {
    this.loadScoreCard();
  }

  ngAfterViewInit(){

  }

  // a function to prepare a list of periods units for analytics
  getPeriodsForAnalytics(periods){
    let period = [];
    for( let per of periods ){
      period.push(per.id);
    }
    return period.join(";");
  }

  // a function to prepare a list of organisation units for analytics
  getOrgUnitsForAnalytics(orgunit_model): string{
    let orgUnits = [];
    let organisation_unit_analytics_string = "";
    // if the selected orgunit is user org unit
    if(orgunit_model.selection_mode == "Usr_orgUnit"){
      if(orgunit_model.user_orgunits.length == 1 || orgunit_model.user_orgunits.length == 0){
        let user_orgunit = this.orgtree.treeModel.getNodeById(orgunit_model.user_orgunits[0]);
        orgUnits.push(user_orgunit.id);
        if(user_orgunit.hasOwnProperty('children')){
          for( let orgunit of user_orgunit.children ){
            orgUnits.push(orgunit.id);
          }
        }
      }else{
        organisation_unit_analytics_string += orgunit_model.selected_user_orgunit
      }
    }

    else{
      // if there is only one organisation unit selected
      if ( orgunit_model.selected_orgunits.length == 1 ){
        let detailed_orgunit = this.orgtree.treeModel.getNodeById(orgunit_model.selected_orgunits[0].id);
        orgUnits.push(detailed_orgunit.id);
        if(detailed_orgunit.hasOwnProperty('children')){
          for( let orgunit of detailed_orgunit.children ){
            orgUnits.push(orgunit.id);
          }
        }

      }
      // If there is more than one organisation unit selected
      else{
        orgunit_model.selected_orgunits.forEach((orgunit) => {
          orgUnits.push(orgunit.id);
        })
      }
      if(orgunit_model.selection_mode == "orgUnit"){

      }if(orgunit_model.selection_mode == "Level"){
        organisation_unit_analytics_string += orgunit_model.selected_level+";";
      }if(orgunit_model.selection_mode == "Group"){
        organisation_unit_analytics_string += orgunit_model.selected_group+";";
      }
    }


    return organisation_unit_analytics_string+orgUnits.join(";");
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

  // get organisation unit name for display on scorecard title
  // get organisation unit name for display on scorecard title
  getOrgunitName(orgunit_model){
    let name= [];
    if ( orgunit_model.selected_orgunits.length == 1){
      name.push( orgunit_model.selected_orgunits[0].name );
    }
    // If there is more than one organisation unit selected
    else{
      orgunit_model.selected_orgunits.forEach((orgunit) => {
        name.push( orgunit.name );
      })
    }
    return name.join(", ");
  }

  // a function that will be used to load scorecard
  indicator_loading: boolean[] = [];
  indicator_done_loading: boolean[] = [];
  old_proccessed_percent = 0;
  proccesed_indicators = 0;
  loadScoreCard( orgunit: any = null ){
    this.showSubScorecard = [];
    this.periods_list = [];
    this.indicator_done_loading = [];
    this.proccessed_percent = 0;
    this.loading = true;
    this.orgunits = [];
    this.loading_message = " Getting scorecard details ";

    // prepare period list( if not ready use the default period )
    if( this.period.length == 0){
      for( let per of this.default_period ){
        this.periods_list.push(per);
      }
    }else{
      for( let per of this.period ){
        this.periods_list.push(per);
      }
    }
    this.proccesed_indicators = 0;
    let old_proccesed_indicators = 0;
    let indicator_list = this.getIndicatorList(this.scorecard,this.periods_list);
    for( let holder of this.scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(this.level == 'top'){
            indicator['values'] = [];
            indicator['tooltip'] = [];
            indicator['previous_values'] = [];
            indicator['showTopArrow'] = [];
            indicator['showBottomArrow'] = [];
          }
          indicator['loading'] = true;
          for ( let current_period of this.periods_list ){
            this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgunit_model),current_period.id, indicator.id)
              .subscribe(
                (data) => {
                  indicator.loading = false;
                  this.loading_message = " Done Fetching data for "+indicator.title+ " " +current_period.name;
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

                    let value_key = orgunit+'.'+current_period.id;
                    indicator.values[value_key] = this.dataService.getIndicatorData(orgunit,current_period.id, data);
                  }
                  this.shown_records = this.orgunits.length;
                  this.indicator_loading[indicator.id] = true;
                  //load previous data
                  let effective_gap = parseInt( indicator.arrow_settings.effective_gap );
                  this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgunit_model),this.filterService.getLastPeriod(current_period.id,this.period_type), indicator.id)
                    .subscribe(
                      ( olddata ) => {
                        for( let prev_orgunit of this.orgunits ){
                          let prev_key = prev_orgunit.id+'.'+current_period.id;
                          indicator.previous_values[prev_key] = this.dataService.getIndicatorData(prev_orgunit.id,this.filterService.getLastPeriod(current_period.id,this.period_type), olddata);
                        }
                        if(indicator.hasOwnProperty("arrow_settings")){
                          for( let key in indicator.values ) {
                            let splited_key = key.split(".");
                            if(parseInt(indicator.previous_values[key]) != 0){
                              let check = parseInt( indicator.values[key] ) > (parseInt( indicator.previous_values[key] ) + effective_gap );
                              let check1 = parseInt( indicator.values[key] ) < (parseInt( indicator.previous_values[key] ) - effective_gap );
                              indicator.showTopArrow[key] = check;
                              indicator.showBottomArrow[key] = check1;
                              //noinspection TypeScriptUnresolvedVariable
                              if(indicator.showTopArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(splited_key[0])){
                                let  rise = indicator.values[key] - parseInt( indicator.previous_values[key]);
                                //noinspection TypeScriptUnresolvedVariable
                                indicator.tooltip[key] = indicator.title +" has raised by "+rise.toFixed(2)+" from "+this.getPeriodName(current_period.id)+ " for "+ data.metaData.names[splited_key[0]]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
                              }//noinspection TypeScriptUnresolvedVariable
                              if(indicator.showBottomArrow[key] && indicator.values[key] != null && indicator.previous_values[key] != null && olddata.metaData.names.hasOwnProperty(splited_key[0])){
                                let  rise = parseFloat( indicator.previous_values[key] ) - indicator.values[key];
                                //noinspection TypeScriptUnresolvedVariable
                                indicator.tooltip[key] = indicator.title +" has decreased by "+rise.toFixed(2)+" from "+this.getPeriodName(current_period.id)+ " for "+ data.metaData.names[splited_key[0]]+" (Minimum gap "+indicator.arrow_settings.effective_gap+")";
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
      }
  }

  // loading sub orgunit details
  sub_unit;
  sub_model:any;
  children_available:boolean[] = [];
  loadChildrenData(selectedorgunit){
    if( selectedorgunit.is_parent || this.showSubScorecard[selectedorgunit.id]){
      this.showSubScorecard = [];
    }
    else{
      let orgunit_with_children = this.orgtree.treeModel.getNodeById(selectedorgunit.id);
      this.sub_unit = orgunit_with_children.data;
      this.sub_model = {
        selection_mode: "orgUnit",
        selected_level: "",
        selected_group: "",
        orgunit_levels: [],
        orgunit_groups: [],
        selected_orgunits: [this.sub_unit],
        user_orgunits: []
      };
      this.showSubScorecard[selectedorgunit.id] = true;
      if( this.sub_unit.hasOwnProperty('children')){
        this.children_available[selectedorgunit.id] = true;
      }else{
        setTimeout(function() {
          this.showSubScorecard = [];
        }, 2000);
      }

    }

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

  // a function to prepare a list of indicators to pass into a table
  getIndicatorList(scorecard, period_list): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        for( let per of period_list ){
          indicators.push(indicator.id+";"+per.id);
        }
      }
    }
    return indicators;
  }

  // a function to see if orgunit is already in the list
  checkOrgunitAvailability(id, array){
    let check = false;
    for( let orgunit of array ){
      if(orgunit.id == id){
        check = true;
      }
    }
    return check;
  }

  // Get the name of the last period for a tooltip display
  getPeriodName(id:string){
    for ( let period of this.filterService.getPeriodArray(this.period_type, this.filterService.getLastPeriod(id,this.period_type).substr(0,4))){
      if( this.filterService.getLastPeriod(id,this.period_type) == period.id){
        return period.name;
      }
    }
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
        if( !hide_this ){
          for (let per of this.periods_list){
            colspan++
          }
        }
      }
    }
    return colspan;
  }

  // A function used to decouple indicator list and prepare them for a display
  getItemsFromGroups(){
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

  // check if a column is empty
  isRowEmpty(orgunit_id:string) : boolean{
    let checker = false;
    let sum = 0;
    let counter = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1){
          sum++;
        }
        if( this.hidenColums.indexOf(indicator.id) == -1 && indicator.values[orgunit_id] == null ) {
          counter++;
        }
      }
    }
    if (counter == sum && !this.scorecard.data.empty_rows){
      checker = true;
    }
    return checker;
  }

  averageHidden(orgunit_id:string, period:string): boolean {
    let checker = false;
    let avg = this.findRowTotalAverage(this.orgunits,period);
    if( this.average_selection == "all"){
      checker = false;
    }else if( this.average_selection == "below"){
      if( this.findRowAverage(orgunit_id,period) >= avg ){
        checker = true
      }
    }else if( this.average_selection == "above"){
      if( this.findRowAverage(orgunit_id,period) <= avg ){
        checker = true
      }
    }
    return checker;
  }

  // check if column is empty
  isEmptyColumn(orgunits, indicator_id,scorecard){
    let sum = 0;
    for ( let orgunit of orgunits ){
      for ( let holder of scorecard.data.data_settings.indicator_holders ){
        for( let indicator of holder.indicators ){
          if(indicator.id == indicator_id && indicator.values[orgunit.id] == null){
            sum++;
          }
        }
      }
    }
    if (sum == orgunits.length){

    }
  }
  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowAverage(orgunit_id,period){
    let sum = 0;
    let counter = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
          for( let per of period ){
            let use_key = orgunit_id+"."+per.id;
            if( this.hidenColums.indexOf(indicator.id) == -1 && indicator.values[use_key] != null ) {
              counter++;
              sum = sum + parseFloat(indicator.values[use_key]);
          }
        }
      }
    }
    return (sum / counter).toFixed(2);
  }
  /**
   * finding the row average
   * @param orgunit_id
   */
  findRowTotalAverage(orgunits,period){
    let sum = 0;
    let n = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1 ){
          for ( let orgunit of orgunits ){
            let usekey = orgunit.id+"."+period;
            if(usekey in indicator.values && indicator.values[usekey] != null){
              n++;
              sum = sum + parseFloat(indicator.values[usekey])
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
  findRowTotalSum(orgunits,period){
    let sum = 0;
    let n = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1 ){
          for ( let orgunit of orgunits ){
            let use_key = orgunit.id+"."+period;
            if(orgunit.id in indicator.values && indicator.values[use_key] != null){
              n++;
              sum = sum + parseFloat(indicator.values[use_key])
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
  findRowSum(orgunit_id:string, period:string){
    let sum = 0;
    let use_key = orgunit_id+"."+period;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if(orgunit_id in indicator.values && indicator.values[use_key] != null ){
          if( this.hidenColums.indexOf(indicator.id) == -1) {
            sum = sum + parseFloat(indicator.values[use_key])
          }
        }
      }
    }
    return sum;
  }

  getCorrectColspan(){
    let i = 0;
    if(this.show_sum_in_row){
      i++;
    }
    if(this.show_average_in_row){
      i++;
    }if(this.scorecard.data.show_rank){
      i++;
    }
    return i;
  }

  // prepare a proper tooltip to display to counter multiple indicators in the same td
  prepareTooltip(holder,orgunit,period): string{
    let tooltip = [];
    let use_key = orgunit+"."+period;
    for (let indicator of holder.indicators ){
      if(indicator.tooltip[use_key]){
        tooltip.push(indicator.tooltip[use_key])
      }
    }
    return tooltip.join(", ");
  }


  getCursorStyle(orgunit){
    if(orgunit.is_parent){
      return "default"
    }else{
      return "pointer"
    }
  }

  // sorting scorecard by clicking the header(if two item in same list will use first item)
  current_sorting = true;
  sorting_on_progress = [];
  sorting_period = "";
  sortScoreCardFromColumn(sortingColumn, sortAscending, orguUnits,period:string, lower_level:boolean = true){
    this.current_sorting = !this.current_sorting;
    this.sorting_column = sortingColumn;
    this.sorting_period = period;
    this.sorting_on_progress[this.sorting_column] = true;
    sortAscending = this.current_sorting;
    if( sortingColumn == "none" ){
      this.dataService.sortArrOfObjectsByParam(orguUnits, "name", sortAscending)
    }
    else if( sortingColumn == 'avg' ){
      for ( let orgunit of orguUnits ){
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id,period));
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    else if( sortingColumn == 'sum' ){
      for ( let orgunit of orguUnits ){
        orgunit['sum'] = this.findRowSum(orgunit.id,period);
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    else{
      for ( let orgunit of orguUnits ){
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn, period );
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    this.sorting_on_progress[this.sorting_column] = false;
    this.sorting_column = (lower_level)?'none':sortingColumn;
  }

  /**
   *sorting scorecard by clicking the header(if two item in same list will use first item)
   * will be applicable when data is on the left
   */
  data_current_sorting = true;
  data_sorting_on_progress = [];
  sortDataScoreCardFromColumn(sortingColumn, sortAscending, orguUnits,period:string, lower_level:boolean = true){
    this.data_current_sorting = !this.data_current_sorting;
    this.sorting_column = sortingColumn;
    this.sorting_on_progress[this.sorting_column] = true;
    sortAscending = this.current_sorting;
    if( sortingColumn == "none" ){
      this.dataService.sortArrOfObjectsByParam(orguUnits, "name", sortAscending)
    }
    else if( sortingColumn == 'avg' ){
      for ( let orgunit of orguUnits ){
        orgunit['avg'] = parseFloat(this.findRowAverage(orgunit.id,period));
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    else if( sortingColumn == 'sum' ){
      for ( let orgunit of orguUnits ){
        orgunit['sum'] = this.findRowSum(orgunit.id,period);
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    else{
      for ( let orgunit of orguUnits ){
        orgunit[sortingColumn] = this.findOrgunitIndicatorValue(orgunit.id, sortingColumn, period );
      }
      this.dataService.sortArrOfObjectsByParam(orguUnits, sortingColumn, sortAscending)
    }
    this.sorting_on_progress[this.sorting_column] = false;
    this.sorting_column = (lower_level)?'none':sortingColumn;
  }

  // hack to find a value of indicator for a specific orgunit
  private findOrgunitIndicatorValue(orgunit_id: string, indicator_id:string, period:string){
    let val:number = 0;
    let use_key = orgunit_id+"."+period;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if(use_key in indicator.values && indicator.values[use_key] != null && indicator.id == indicator_id){
          val = parseFloat(indicator.values[use_key])
        }
      }
    }
    return val;
  }

  // load a preview function
  loadPreview(holderGroup,indicator, ou){
    // emit the array with these items;
    this.show_details.emit({
      holderGroup:holderGroup,
      indicator: indicator,
      ou: ou
    });
  }

  // load a preview function when event
  loadPreviewFromChild($event){
    // emit the array with these items;
    this.show_details.emit({
      holderGroup:$event.holderGroup,
      indicator: $event.indicator,
      ou: $event.ou
    });
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
