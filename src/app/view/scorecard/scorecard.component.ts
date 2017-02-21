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
  @Input() period: any;
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
    this.indicator_done_loading = [];
    this.proccessed_percent = 0;
    this.loading = true;
    this.orgunits = [];
    this.loading_message = " Getting scorecard details ";

    this.proccesed_indicators = 0;
    let old_proccesed_indicators = 0;
    let indicator_list = this.getIndicatorList(this.scorecard);
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
          this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgunit_model),this.period.id, indicator.id)
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
                this.indicatorCalls.push(this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgunit_model),this.filterService.getLastPeriod(this.period.id,this.period_type), indicator.id)
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
      if( this.sub_unit.hasOwnProperty('children')){
        this.children_available[selectedorgunit.id] = true;
      }
      this.showSubScorecard[selectedorgunit.id] = true;

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
  getIndicatorList(scorecard): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        indicators.push(indicator.id);
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
        if( !hide_this ){ colspan++ }
      }
    }
    return colspan;
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

  averageHidden(orgunit_id:string): boolean {
    let checker = false;
    let avg = this.findRowTotalAverage(this.orgunits);
    if( this.average_selection == "all"){
      checker = false;
    }else if( this.average_selection == "below"){
      if( this.findRowAverage(orgunit_id) >= avg ){
        checker = true
      }
    }else if( this.average_selection == "above"){
      if( this.findRowAverage(orgunit_id) <= avg ){
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
  findRowAverage(orgunit_id){
    let sum = 0;
    let counter = 0;
    for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        if( this.hidenColums.indexOf(indicator.id) == -1 && indicator.values[orgunit_id] != null ) {
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
  prepareTooltip(holder,orgunit): string{
    let tooltip = [];
    for (let indicator of holder.indicators ){
      if(indicator.tooltip[orgunit]){
        tooltip.push(indicator.tooltip[orgunit])
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
  sortScoreCardFromColumn(sortingColumn, sortAscending, orguUnits, lower_level:boolean = true){
    this.current_sorting = !this.current_sorting;
    this.sorting_column = sortingColumn;
    this.sorting_on_progress[this.sorting_column] = true;
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
    this.sorting_on_progress[this.sorting_column] = false;
    this.sorting_column = (lower_level)?'none':sortingColumn;
  }

  // hack to find a value of indicator for a specific orgunit
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
