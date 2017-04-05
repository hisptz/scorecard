import { Injectable } from '@angular/core';

@Injectable()
export class VisualizerService {
  enable_labels:boolean = false;
  constructor() { }

  drawChart ( analyticObject: any, chartConfiguration:any ) {
    let chartObject = null;
    if(!chartConfiguration.hasOwnProperty('show_labels')){
      chartConfiguration.show_labels = false;
    }
    switch (chartConfiguration.type){
      case 'bar':
        chartObject = this.drawOtherCharts(analyticObject, chartConfiguration);
        chartObject.plotOptions = {bar:{dataLabels: {
          enabled: chartConfiguration.show_labels
        }}};
        break;
      case 'column':
        chartObject = this.drawOtherCharts(analyticObject, chartConfiguration);
        chartObject.plotOptions = {column:{dataLabels: {
          enabled: chartConfiguration.show_labels
        }}};
        break;
      case 'radar':
        chartObject = this.drawSpiderChart(analyticObject, chartConfiguration);
        break;
      case 'stacked_column':
        chartConfiguration.stackingType = "column";
        chartObject = this.drawStackedChart(analyticObject, chartConfiguration);
        break;
      case 'stacked_bar':
        chartConfiguration.stackingType = "bar";
        chartObject = this.drawStackedChart(analyticObject, chartConfiguration);
        break;
      case 'gauge':
        chartObject = this.drawGaugeChart(analyticObject, chartConfiguration);
        break;
      case 'combined':
        chartObject = this.drawCombinedChart(analyticObject, chartConfiguration);
        chartObject.plotOptions = {column:{dataLabels: {
          enabled: chartConfiguration.show_labels
        }}};
        break;
      case 'line':
        chartObject = this.drawOtherCharts(analyticObject, chartConfiguration);
        chartObject.plotOptions = {line:{dataLabels: {
          enabled: chartConfiguration.show_labels
        }}};
        break;
      case 'area':
        chartObject = this.drawOtherCharts(analyticObject, chartConfiguration);
        chartObject.plotOptions = {area:{dataLabels: {
          enabled: chartConfiguration.show_labels
        }}};
        break;
      case 'pie':
        chartObject = this.drawPieChart(analyticObject, chartConfiguration);
        break;
      default :
        chartObject = this.drawOtherCharts(analyticObject, chartConfiguration);
        break;
    }
    chartObject.credits =  {enabled: false};
    return chartObject;
  }

  /**
   * finding the position of the item in rows- used when fetching data
   * @param analyticsObjectHeaders : Array
   * @param name : String ['ou','dx','co','pe',....]
   * @returns {number}
   * @private
   */
  _getTitleIndex (analyticsObjectHeaders, name: string) {
    let index = 0;
    let counter = 0;
    for ( let header of analyticsObjectHeaders ) {
      if(header.name == name){
        index = counter;
      }
      counter++;
    }
    return index;
  }

  _sanitizeIncomingAnalytics( analyticsObject:any ){
    for(let header of analyticsObject.headers ){
      if(header.hasOwnProperty("optionSet")){
        if( analyticsObject.metaData[header.name].length == 0 ){
          analyticsObject.metaData[header.name] = this._getRowItems(this._getTitleIndex(analyticsObject.headers, header.name), analyticsObject.rows);
          for( let item of analyticsObject.metaData[header.name] ){
            analyticsObject.metaData.names[item] = item;
          }

        }else{
          for( let item of analyticsObject.metaData[header.name] ){
            analyticsObject.metaData.names[item] = item;
          }
        }
      }
    }

    return analyticsObject;
  }

  _getRowItems( position:number, array ) {
    let return_array = [];
    for (let item of array ){
      if( return_array.indexOf(item[position]) == -1 ){
        return_array.push(item[position]);
      }
    }

    console.log(return_array)
    return return_array;
  }

  /**
   * Get an array of specified metadata
   * @param analyticsObject : Result from analytics call
   * @param metadataType : String ['ou','dx','co','pe',....]
   * @returns {Array}
   */
  getMetadataArray (analyticsObject, metadataType: string) {
    let metadataArray = [];
    if(metadataType === 'dx'){
      metadataArray = analyticsObject.metaData.dx;
    }else if(metadataType === 'ou'){
      metadataArray = analyticsObject.metaData.ou;
    }else if(metadataType === 'co'){
      metadataArray = analyticsObject.metaData.co;
    }else if(metadataType === 'pe'){
      metadataArray = analyticsObject.metaData.pe;
    }else{
      metadataArray = analyticsObject.metaData[metadataType];
    }
    return metadataArray;
  }

  /**
   * Return a detailed metadata with names and ids for a selected metadata
   * @param analyticsObject : Result from analytics call
   * @param metadataType : String ['ou','dx','co','pe',....]
   * @returns {Array}
   */
  getDetailedMetadataArray ( analyticsObject, metadataType: string ) {
    let metadataArray = [];
    analyticsObject = this._sanitizeIncomingAnalytics(analyticsObject);
    for (let item of analyticsObject.metaData[metadataType]) {
      metadataArray.push({
        id:item,
        name:analyticsObject.metaData.names[item]
      })
    }
    return metadataArray;
  }

  /**
   * return the meaningfull array of xAxis and yAxis Items
   * x axisItems and yAxisItems are specified if you want few data type array['uid1','uid2'], ie a subset of all available items
   * @param analyticsObject
   * @param xAxis : String ['ou','dx','co','pe',....]
   * @param yAxis : String ['ou','dx','co','pe',....]
   * @param xAxisItems : Array
   * @param yAxisItems : Array
   * @returns {{xAxisItems: Array, yAxisItems: Array}}
   */
  prepareCategories ( analyticsObject, xAxis: string, yAxis: string, xAxisItems = [],  yAxisItems = []){
    analyticsObject = this._sanitizeIncomingAnalytics(analyticsObject);
    let structure = {
      'xAxisItems':[],
      'yAxisItems':[]
    };
    if(xAxisItems.length === 0){
      for ( let val of this.getMetadataArray(analyticsObject,xAxis )){
        structure.xAxisItems.push( {'name':analyticsObject.metaData.names[val], 'uid': val} );
      }
    }if ( xAxisItems.length !== 0 ) {
      for ( let val of xAxisItems ){
        structure.xAxisItems.push( {'name': analyticsObject.metaData.names[val], 'uid': val} );
      }
    }if ( yAxisItems.length !== 0 ) {
      for ( let val of yAxisItems ){
        structure.yAxisItems.push( {'name': analyticsObject.metaData.names[val] , 'uid': val} );
      }
    }if( yAxisItems.length === 0 ){
      for (let val of this.getMetadataArray(analyticsObject,yAxis) ){
        structure.yAxisItems.push( {'name': analyticsObject.metaData.names[val], 'uid': val} );
      }
    }
    return structure;
  }

  /**
   * return the meaningful array of single selection only
   * @param analyticsObject
   * @param xAxis
   * @param xAxisItems
   * @returns {{xAxisItems: Array, yAxisItems: Array}}
   */
  prepareSingleCategories ( analyticsObject, itemIdentifier , preDefinedItems = [] ){
    analyticsObject = this._sanitizeIncomingAnalytics(analyticsObject);
    let structure = [];
    if ( preDefinedItems.length === 0 ) {
      for ( let val of this.getMetadataArray(analyticsObject, itemIdentifier )){
        structure.push( {'name':analyticsObject.metaData.names[val], 'uid': val, 'type': itemIdentifier} );
      }
    }if ( preDefinedItems.length !== 0 ) {
      for ( let val of preDefinedItems ){
        structure.push( {'name': analyticsObject.metaData.names[val], 'uid': val, 'type': itemIdentifier} );
      }
    }
    return structure;
  }

  /**
   * try to find data from the rows of analytics object
   * @param analyticsObject : Result from analytics call
   * @param dataItems : Array of data to check each array item is an object [{'type':'ou','value':'bN5q5k5DgLA'},{'type': 'dx', 'value': 'eLo4RXcQIi5'}....]
   * @returns {number}
   */
  getDataValue ( analyticsObject, dataItems = [] ) {
    let num = 0;
    for ( let value of analyticsObject.rows) {
      let counter = 0;
      for ( let item of dataItems ){
        if ( value[this._getTitleIndex( analyticsObject.headers, item.type )] === item.value ) {
          counter ++;
        }
      }
      if ( counter === dataItems.length ) {
        num += parseFloat( value[this._getTitleIndex( analyticsObject.headers, 'value' )]);
      }
    }
    return num;
  }

  // TODO: Implement the map details here

  /**
   * preparing an item to pass on the getDataValue function
   * separated here since it is used by all our chart drawing systems
   * @param chartConfiguration
   * @param xAxis
   * @param yAxis
   * @returns {Array}
   */
  getDataObject ( chartConfiguration, xAxis, yAxis ) {
    let dataItems = [];
    dataItems.push( {'type': chartConfiguration.xAxisType, 'value': xAxis.uid } );
    dataItems.push( {'type': chartConfiguration.yAxisType, 'value': yAxis.uid } );
    if ( chartConfiguration.hasOwnProperty( 'filterType' )) {
      dataItems.push( {'type': chartConfiguration.filterType , 'value': chartConfiguration.filterUid} );
    }
    return dataItems;
  }

  /**
   * Draw a pie chart
   * @param analyticsObject
   * @param chartConfiguration : object {'title':'','xAxisType':'',yAxisType:'','filterType':''} (filterType is optional)
   * @returns {{options, series}|any}
   */
  drawPieChart ( analyticsObject, chartConfiguration ){

    let chartObject = this.getChartConfigurationObject('pieChart',chartConfiguration.show_labels);
    chartObject.title.text = chartConfiguration.title;
    let metaDataObject = this.prepareCategories(analyticsObject, chartConfiguration.xAxisType, chartConfiguration.yAxisType, chartConfiguration.xAxisItems, chartConfiguration.yAxisItems);
    let serie = [];
    for ( let yAxis of metaDataObject.yAxisItems ){
      for ( let xAxis of metaDataObject.xAxisItems ){
        let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
        let number = this.getDataValue( analyticsObject, dataItems );
        serie.push( {
          'name': yAxis.name+' - '+ xAxis.name ,
          'y': number
        } );
      }
    }
    chartObject.series.push({
      name: chartConfiguration.title ,
      data: serie,
      showInLegend: false,
      dataLabels: {
        enabled: false
      } });
    return chartObject;
  }

  /**
   * drawing combined chart
   * @param analyticsObject
   * @param chartConfiguration : object {'title':'','xAxisType':'',yAxisType:'','filterType':''} (filterType is optional)
   * @returns {{title, chart, xAxis, yAxis, labels, series}|any}
   */
  drawCombinedChart (analyticsObject, chartConfiguration ) {
    let chartObject = this.getChartConfigurationObject('defaultChartObject',chartConfiguration.show_labels);
    chartObject.title.text = chartConfiguration.title;
    chartObject.chart.type = "";
    let pieSeries = [];
    let metaDataObject = this.prepareCategories( analyticsObject,
      chartConfiguration.xAxisType,
      chartConfiguration.yAxisType,
      (chartConfiguration.hasOwnProperty('xAxisItems'))?chartConfiguration.xAxisItems:[],
      (chartConfiguration.hasOwnProperty('yAxisItems'))?chartConfiguration.yAxisItems:[]
    );
    // set x-axis categories
    chartObject.xAxis.categories = [];
    for ( let val of metaDataObject.xAxisItems ) {
      chartObject.xAxis.categories.push(val.name);
    }
    chartObject.series = [];
    for ( let yAxis of metaDataObject.yAxisItems ){
      let barSeries = [];
      for ( let xAxis of metaDataObject.xAxisItems ){
        let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
        let number = this.getDataValue( analyticsObject, dataItems );
        barSeries.push(number);
        pieSeries.push({'name': yAxis.name+' - '+ xAxis.name , 'y': number });
      }
      chartObject.series.push({type: 'column', name: yAxis.name, data: barSeries});
      chartObject.series.push({type: 'spline', name: yAxis.name, data: barSeries});
      if ( chartConfiguration.hasOwnProperty('show_pie') && chartConfiguration.show_pie ){
        chartObject.series.push({type: 'pie', name: yAxis.name, data: pieSeries});
      }
    }
    return chartObject;
  }

  /**
   * draw other charts
   * @param analyticsObject
   * @param chartConfiguration : Object {'type':'line','title': 'My chart', 'xAxisType': 'pe', 'yAxisType': 'dx' ....}
   * @returns {{title, chart, xAxis, yAxis, labels, series}|any}
   */
  drawOtherCharts (analyticsObject, chartConfiguration ){
    let chartObject = this.getChartConfigurationObject('defaultChartObject',chartConfiguration.show_labels);
    if ( chartConfiguration.type == 'bar' ){
      chartObject.chart.type = chartConfiguration.type;
      chartObject.xAxis.labels.rotation = 0;
    }else{
      chartObject.chart.type = ""
    }
    chartObject.title.text = chartConfiguration.title;
    let metaDataObject = this.prepareCategories(analyticsObject,
      chartConfiguration.xAxisType,
      chartConfiguration.yAxisType,
      (chartConfiguration.hasOwnProperty('xAxisItems'))?chartConfiguration.xAxisItems:[],
      (chartConfiguration.hasOwnProperty('yAxisItems'))?chartConfiguration.yAxisItems:[]
    );
    chartObject.xAxis.categories = [];
    for ( let val of metaDataObject.xAxisItems ) {
      chartObject.xAxis.categories.push( val.name );
    }
    chartObject.series = [];
    for ( let yAxis of metaDataObject.yAxisItems ) {
      let chartSeries = [];
      for ( let xAxis of metaDataObject.xAxisItems ) {
        let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
        let number = this.getDataValue( analyticsObject, dataItems );
        chartSeries.push( number );
      }
      chartObject.series.push( {
        type: chartConfiguration.type,
        name: yAxis.name, data: chartSeries
      } );
    }
    return chartObject;
  }

  /**
   *
   * @param analyticsObject
   * @param chartConfiguration - same as when your drawing bar, line, column chart
   * @returns {Array} - in a format ready to be consumed by the ng2CSV library (https://github.com/javiertelioz/angular2-csv)
   */
  getCsvData( analyticsObject, chartConfiguration ){
    let data = [];
    let chartObject = this.drawOtherCharts(analyticsObject, chartConfiguration);
    for ( let value of chartObject.series){
      let obj = {name:value.name};
      let i = 0;
      for( let val of chartObject.xAxis.categories){
        obj[val] = value.data[i];
        i++;
      }
      data.push(obj);
    }
    return data;
  }

  /**
   *
   * @param analyticsObject
   * @param chartConfiguration :Object {'stackingType':'[bar,column]','title': 'My chart', 'xAxisType': 'pe', 'yAxisType': 'dx' ....}
   * @returns {any}
   */
  drawStackedChart ( analyticsObject, chartConfiguration ) {

    // decide which chart object to use
    let chartObject = ( chartConfiguration.stackingType == 'bar' ) ?
      this.getChartConfigurationObject('barStackedObject',chartConfiguration.show_labels):
      this.getChartConfigurationObject('stackedChartObject',chartConfiguration.show_labels);

    chartObject.title.text = chartConfiguration.title;
    let metaDataObject = this.prepareCategories(analyticsObject,
      chartConfiguration.xAxisType,
      chartConfiguration.yAxisType,
      (chartConfiguration.hasOwnProperty('xAxisItems')) ? chartConfiguration.xAxisItems : [],
      (chartConfiguration.hasOwnProperty('yAxisItems')) ? chartConfiguration.yAxisItems : []
    );
    chartObject.xAxis.categories = [];
    chartObject.series = [];
    for ( let val of metaDataObject.xAxisItems ) {
      chartObject.xAxis.categories.push(val.name);
    }
    for ( let yAxis of metaDataObject.yAxisItems ){
      let chartSeries = [];
      for ( let xAxis of metaDataObject.xAxisItems ) {
        let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
        let number = this.getDataValue( analyticsObject, dataItems );
        chartSeries.push( number );
      }
      chartObject.series.push( {
        name: yAxis.name,
        data: chartSeries
      } );
    }
    return chartObject;
  }

  /**
   * drawing a solid gauge graph ( needs inclusion of module/solid-gauge )
   * @param analyticsObject
   * @param chartConfiguration :Object {'maximum_score':'maximum for gauge[100]','title': 'My chart', ....}
   * @returns {{chart, title, pane, tooltip, yAxis, plotOptions, credits, series}|any}
   */
  drawGaugeChart ( analyticsObject, chartConfiguration ) {
    let chartObject = this.getChartConfigurationObject('gaugeObject',chartConfiguration.show_labels);
    chartObject.title.text = chartConfiguration.title;
    let metaDataObject = this.prepareCategories(analyticsObject,
      chartConfiguration.xAxisType,
      chartConfiguration.yAxisType,
      (chartConfiguration.hasOwnProperty('xAxisItems')) ? chartConfiguration.xAxisItems : [],
      (chartConfiguration.hasOwnProperty('yAxisItems')) ? chartConfiguration.yAxisItems : []
    );
    let gaugeValue  = 0;
    for ( let yAxis of metaDataObject.yAxisItems ) {
      let chartSeries = [];
      for ( let xAxis of metaDataObject.xAxisItems ) {
        let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
        let number = this.getDataValue( analyticsObject, dataItems );
        chartSeries.push( number );
        gaugeValue = number ;
      }
    }
    chartObject.series = [];
    chartObject.yAxis.max = (chartConfiguration.hasOwnProperty('maximum_score')) ? chartConfiguration.maximun_score : 100;
    chartObject.series.push({
      name: chartConfiguration.title,
      data: [gaugeValue],
      tooltip: {
        valueSuffix: ' '
      }
    });
    return chartObject;
  }

  /**
   * drawing a spider chart ( needs inclusion of highcharts-more )
   * @param analyticsObject
   * @param chartConfiguration
   * @returns {{chart: {polar: boolean, type: string, events: {load: ((chart:any)=>undefined)}}, title: {text: any, x: number}, pane: {size: string}, xAxis: {categories: Array, tickmarkPlacement: string, lineWidth: number}, yAxis: {gridLineInterpolation: string, lineWidth: number, min: number}, tooltip: {shared: boolean}, legend: {align: string, verticalAlign: string, y: number, layout: string}, series: Array}}
   */
  drawSpiderChart ( analyticsObject, chartConfiguration ) {
    let metaDataObject = this.prepareCategories(analyticsObject,
      chartConfiguration.xAxisType,
      chartConfiguration.yAxisType,
      (chartConfiguration.hasOwnProperty('xAxisItems')) ? chartConfiguration.xAxisItems : [],
      (chartConfiguration.hasOwnProperty('yAxisItems')) ? chartConfiguration.yAxisItems : []
    );
    let categories = [];
    for ( let val of metaDataObject.xAxisItems ) {
      categories.push(val.name);
    }

    let series = [];
    for ( let yAxis of metaDataObject.yAxisItems){
      let chartSeries = [];
      for ( let xAxis of metaDataObject.xAxisItems ) {
        let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
        let number = this.getDataValue( analyticsObject, dataItems );
        chartSeries.push( number );
      }
      series.push({name: yAxis.name, data: chartSeries, pointPlacement: 'on'});
    }
    let piechartObject = {
      chart: {
        polar: true,
        type: 'area',
        events: {
          load: function(chart) {
            setTimeout(function() {
              chart.target.reflow();
            },0 );
          }
        }
      },

      title: {
        text: chartConfiguration.title,
        x: -80
      },

      pane: {
        size: '90%'
      },

      xAxis: {
        categories: categories,
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0
      },

      tooltip: {
        shared: true
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        y: 70,
        layout: 'horizontal'
      },
      series: series

    };
    return piechartObject;
  }

  drawTable ( analyticsObject , tableConfiguration ) {
    // console.log(tableConfiguration);
    let table = {
      'headers': [],
      'columns': [],
      'rows': [],
      'titles': {
        'rows': [],
        'column': []
      }
    };
    if (tableConfiguration.hasOwnProperty("display_list") && tableConfiguration.display_list) {
      table.headers[0] = {
        items: [],
        style: ""
      };
      tableConfiguration.columns[tableConfiguration.columns.indexOf('pe')] = 'eventdate';
      tableConfiguration.columns[tableConfiguration.columns.indexOf('ou')] = 'ouname';
      for ( let item of tableConfiguration.columns ){
        table.headers[0].items.push(
          {
            name: analyticsObject.headers[this._getTitleIndex(analyticsObject.headers,item)].column,
            span: 1
          }
        )
      }
      for( let item of analyticsObject.rows ){
        let column_items = [];
        for ( let col of tableConfiguration.columns ){
          let index = this._getTitleIndex( analyticsObject.headers,col );
          column_items.push({
            name:"",
            display:true,
            row_span: "1",
            val: item[index]
          })

        }
        table.rows.push(
          {
            headers:[],
            items:column_items
          }
        )
      }
    } else {
      // add names to titles array
      for (let item of tableConfiguration.columns) {
        table.titles.column.push(analyticsObject.headers[this._getTitleIndex(analyticsObject.headers, item)].column);
      }
      for (let item of tableConfiguration.rows) {
        table.titles.rows.push(analyticsObject.headers[this._getTitleIndex(analyticsObject.headers, item)].column);
      }
      for (let columnItem of tableConfiguration.columns) {
        let dimension = this.calculateColSpan(analyticsObject, tableConfiguration.columns, columnItem);
        let currentColumnItems = this.prepareSingleCategories(analyticsObject, columnItem);
        let headerItem = [];
        for (let i = 0; i < dimension.duplication; i++) {
          for (let currentItem of currentColumnItems) {
            headerItem.push({'name': currentItem.name, 'span': dimension.col_span});
          }
        }
        let styles = '';
        if (tableConfiguration.hasOwnProperty('style')) {
          if (tableConfiguration.styles.hasOwnProperty(columnItem)) {
            styles = tableConfiguration.styles[columnItem]
          }
        }
        table.headers.push({'items': headerItem, 'style': styles});
      }
      for (let rowItem of tableConfiguration.rows) {
        table.columns.push(rowItem);
      }

      // Preparing table columns
      let column_length = tableConfiguration.columns.length;
      let column_items_array = [];
      for (let i = 0; i < column_length; i++) {
        let currentRowItems = this.prepareSingleCategories(analyticsObject, tableConfiguration.columns[i]);
        column_items_array.push(currentRowItems);
      }
      let table_columns_array = [];
      for (let i = 0; i < column_items_array.length; i++) {
        if (table_columns_array.length === 0) {
          for (let item of column_items_array[i]) {
            table_columns_array.push([item]);
          }
        } else {
          let temp_arr = table_columns_array.concat();
          table_columns_array = [];
          for (let item of temp_arr) {
            for (let val of  column_items_array[i]) {
              if (item instanceof Array) {
                let tempArr = Array.from(item);
                table_columns_array.push(tempArr.concat([val]));
              } else {
                table_columns_array.push([item, val]);
              }
            }
          }
        }

      }

      // Preparing table rows
      let rows_length = tableConfiguration.rows.length;
      let row_items_array = [];
      for (let i = 0; i < rows_length; i++) {
        let dimension = this.calculateColSpan(analyticsObject, tableConfiguration.rows, tableConfiguration.rows[i]);
        let currentRowItems = this.prepareSingleCategories(analyticsObject, tableConfiguration.rows[i]);
        row_items_array.push({'items': currentRowItems, 'dimensions': dimension});
      }
      let table_rows_array = [];
      for (let i = 0; i < row_items_array.length; i++) {
        if (table_rows_array.length === 0) {
          for (let item of row_items_array[i].items) {
            item.dimensions = row_items_array[i].dimensions;
            table_rows_array.push([item]);
          }
        } else {
          let temp_arr = table_rows_array.concat();
          table_rows_array = [];
          for (let item of temp_arr) {
            for (let val of  row_items_array[i].items) {
              val.dimensions = row_items_array[i].dimensions;
              if (item instanceof Array) {
                let tempArr = Array.from(item);
                table_rows_array.push(tempArr.concat([val]));
              } else {
                table_rows_array.push([item, val]);
              }
            }
          }
        }

      }

      let counter = 0;
      if(table_rows_array.length != 0){
        for (let rowItem of table_rows_array) {
          let item = {
            'items': [],
            'headers': rowItem
          };
          for (let val of rowItem) {
            if (counter === 0 || counter % val.dimensions.col_span === 0) {
              item.items.push({'name': val.uid, 'val': val.name, 'row_span': val.dimensions.col_span});
            }
          }
          for (let colItem of table_columns_array) {
            let dataItem = [];
            for (let val of rowItem) {
              dataItem.push({'type': val.type, 'value': val.uid});
            }
            for (let val of colItem) {
              dataItem.push({'type': val.type, 'value': val.uid});
            }
            item.items.push({
              'name': '',
              'val': this.getDataValue(analyticsObject, dataItem),
              'row_span': '1',
              'display': true
            });
          }
          if (tableConfiguration.hasOwnProperty("hide_zeros") && tableConfiguration.hide_zeros) {
            if (!this.checkZeros(tableConfiguration.rows.length, item.items)) {
              table.rows.push(item);
            }
          } else {
            table.rows.push(item);
          }

          counter++;
        }
      }else{
        let item = {
          'items': [],
          'headers': []
        };
        for (let colItem of table_columns_array) {
          let dataItem = [];
          for (let val of colItem) {
            dataItem.push({'type': val.type, 'value': val.uid});
          }
          item.items.push({
            'name': '',
            'val': this.getDataValue(analyticsObject, dataItem),
            'row_span': '1',
            'display': true
          });
        }
        if (tableConfiguration.hasOwnProperty("hide_zeros") && tableConfiguration.hide_zeros) {
          if (!this.checkZeros(tableConfiguration.rows.length, item.items)) {
            table.rows.push(item);
          }
        } else {
          table.rows.push(item);
        }
      }
    }
    return table;
  }

  checkZeros(stating_length,  array ): boolean{
    let checker = true;
    for (let  i =stating_length; i<array.length; i++){
      if( parseInt(array[i].val) != 0 ){
        checker = false
      }
    }
    return checker;
  }

  calculateColSpan (analyticsObject, array, item ) {
    let indexOfItem = array.indexOf(item);
    let array_length = array.length;
    let last_index = array_length - 1;
    let dimensions = { 'col_span': 1, 'duplication': 1};
    for (let i = last_index; i > indexOfItem; i--) {
      let arr = this.prepareSingleCategories(analyticsObject, array[i] );
      dimensions.col_span = dimensions.col_span * arr.length;
    }
    for (let i = 0; i < indexOfItem; i++ ) {
      let arr = this.prepareSingleCategories(analyticsObject, array[i] );
      dimensions.duplication = dimensions.duplication * arr.length;
    }
    return dimensions;

  }

  getChartConfigurationObject(type,show_labels:boolean = false): any{
    if(type == "defaultChartObject"){
      return {
        title: {
          text: ''
        },
        chart: {
          events: {
            load: function(chart) {
              setTimeout(function() {
                chart.target.reflow();
              }, 0);
            }
          },
          type:''
        },
        xAxis: {
          categories: [],
          labels: {
            rotation: -45,
            style: {'color': '#000000', 'fontWeight': 'normal'}
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          }, labels: {
            style: {'color': '#000000', 'fontWeight': 'bold'}
          }
        },
        labels: {
          items: [{
            html: '',
            style: {
              left: '50px',
              top: '18px'
              //color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
            }
          }]
        },
        plotOptions: {},
        series: []
      };
    }
    else if(type == "stackedChartObject"){
      return {
        chart: {
          type: 'column',
          events: {
            load: function(chart) {
              setTimeout(function() {
                chart.target.reflow();
              }, 0);
            }
          }
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          },
          stackLabels: {
            enabled: show_labels,
            style: {
              fontWeight: 'bold'
            }
          }
        },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: false
            }
          }
        },
        series: []
      };
    }
    else if(type == "barStackedObject"){
      return {
        chart: {
          type: 'bar',
          events: {
            load: function(chart) {
              setTimeout(function() {
                chart.target.reflow();
              }, 0);
            }
          }
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          },
          stackLabels: {
            enabled: show_labels,
            style: {
              fontWeight: 'bold'
            }
          }
        },
        legend: {
          reversed: true
        },
        plotOptions: {
          series: {
            stacking: 'normal',
            dataLabels: {
              enabled: false
            }
          }
        },
        series: []
      };
    }
    else if(type == "gaugeObject"){
      return {
        chart: {
          type: 'solidgauge',
          events: {
            load: function(chart) {
              setTimeout(function() {
                chart.target.reflow();
              }, 0);
            }
          }
        },

        title: {
          text : ''
        },

        pane: {
          center: ['50%', '85%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: false
        },

        // the value axis
        yAxis: {
          stops: [
            [0.1, '#DF5353'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#55BF3B'] // red
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 400,
          tickWidth: 0,
          labels: {
            y: 16
          },
          min: 0,
          max: 100,
          title: {
            text: ''
          }
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        },
        credits: {
          enabled: false
        },
        series: []
      };
    }
    else if(type == "pieChart"){
      return {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
          text: ''
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            borderWidth: 0,
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: 'black'
              }
            }
          }
        },
        series: []
      };
    }
  }
}
