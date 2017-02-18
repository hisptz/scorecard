import {Component, OnInit, Input} from '@angular/core';
import {Constants} from "../../shared/costants";

@Component({
    selector: 'ng2-dhis-visualizer',
    templateUrl: `
        <div [ng2-highcharts]="chartData" *ngIf="visualizer_config.type == 'chart'"></div>
        <table class="table table-bordered" *ngIf="visualizer_config.type == 'table'">
            <thead>
            <tr *ngFor="let header of tableData.headers">
                <th *ngFor="let table_column of tableData.columns"></th>
                <th *ngFor="let header_column of header.items" [colSpan]="header_column.span" style="text-align: center">
                    {{ header_column.name }}
                </th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let row of tableData.rows">
                <td *ngFor="let header_column of row.items" style="text-align: center;vertical-align: middle" [attr.rowspan]="header_column.row_span">
                    {{ header_column.val }}
                </td>
            </tr>
            </tbody>
        </table>
        `,
    styleUrls: [``]
})
export class Ng2DhisVisualizerComponent implements OnInit {
    chartData = {};
    tableData = {};

    @Input() visualizer_data: any;
    @Input() visualizer_config: any;
    constructor() { }

    ngOnInit() {
        if (this.visualizer_config.type === 'table') {
            this.tableData = this.drawTable( this.visualizer_data, this.visualizer_config.tableConfiguration);
        }else if (this.visualizer_config.type === 'chart') {
            this.chartData = this.drawChart( this.visualizer_data, this.visualizer_config.chartConfiguration);
        }
    }


    drawChart ( analyticObject: any, chartConfiguration:any ) {
      return this.drawOtherCharts( analyticObject, chartConfiguration);
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

        let chartObject = this.chart_configuration_objects.defaultChartObject;
        chartObject.title.text = chartConfiguration.title;

        let metaDataObject = this.prepareCategories(analyticsObject, chartConfiguration.xAxisType, chartConfiguration.yAxisType, chartConfiguration.xAxisItems, chartConfiguration.yAxisItems);
        let serie = [];
        for ( let yAxis of metaDataObject.yAxisItems ){
            for ( let xAxis of metaDataObject.xAxisItems ){
                let dataItems = this.getDataObject( chartConfiguration, xAxis, yAxis );
                console.log(dataItems);
                let number = this.getDataValue( analyticsObject, dataItems );
                serie.push( {
                    'name': yAxis.name+' - '+ xAxis.name ,
                    'y': number
                } );
            }
        }
        chartObject.series.push({
            type: 'pie',
            name: chartConfiguration.title ,
            data: serie,
            showInLegend: true,
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
        let chartObject = this.chart_configuration_objects.defaultChartObject;
        chartObject.title.text = chartConfiguration.title;

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
        let chartObject = this.chart_configuration_objects.defaultChartObject;
        if ( chartConfiguration.type == 'bar' ){
            chartObject.chart.type = chartConfiguration.type;
            chartObject.xAxis.labels.rotation = 0;
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
     * @param chartConfiguration :Object {'stackingType':'[bar,column]','title': 'My chart', 'xAxisType': 'pe', 'yAxisType': 'dx' ....}
     * @returns {any}
     */
    drawStackedChart ( analyticsObject, chartConfiguration ) {

        // decide which chart object to use
        let chartObject = ( chartConfiguration.stackingType == 'bar' ) ?
            this.chart_configuration_objects.barStackedObject:
            this.chart_configuration_objects.stackedChartObject;

        chartObject.title.text = chartConfiguration.title;
        let metaDataObject = this.prepareCategories(analyticsObject,
            chartConfiguration.xAxisType,
            chartConfiguration.yAxisType,
            (chartConfiguration.hasOwnProperty('xAxisItems')) ? chartConfiguration.xAxisItems : [],
            (chartConfiguration.hasOwnProperty('yAxisItems')) ? chartConfiguration.yAxisItems : []
        );
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
        let chartObject = this.chart_configuration_objects.gaugeObject;
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
        let chartObject = {
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
        return chartObject;
    }


    drawTable ( analyticsObject , tableConfiguration ) {
        let table = {
            'headers': [],
            'columns': [],
            'rows': []
        };
        for ( let columnItem of tableConfiguration.columns ) {
            let dimension = this.calculateColSpan (analyticsObject , tableConfiguration.columns, columnItem);
            let currentColumnItems = this.prepareSingleCategories( analyticsObject, columnItem );
            let headerItem = [];
            for (let i = 0; i < dimension.duplication; i++ ) {
                for ( let currentItem of currentColumnItems ){
                    headerItem.push({ 'name': currentItem.name, 'span': dimension.col_span });
                }
            }
            let styles = '';
            if(tableConfiguration.hasOwnProperty('style') ){
                if(tableConfiguration.styles.hasOwnProperty(columnItem)){
                  styles = tableConfiguration.styles[columnItem]
                }
            }
            table.headers.push( {'items': headerItem, 'style': styles} );
        }
        for ( let rowItem of tableConfiguration.rows ) {
            table.columns.push( rowItem );
        }

        // Preparing table columns
        let column_length = tableConfiguration.columns.length;
        let column_items_array = [];
        for ( let i = 0; i < column_length; i++ ) {
            let currentRowItems = this.prepareSingleCategories( analyticsObject, tableConfiguration.columns[i] );
            column_items_array.push( currentRowItems );
        }
        let table_columns_array = [];
        for (let i = 0; i < column_items_array.length; i++ ) {
            if ( table_columns_array.length === 0 ) {
                for ( let item of column_items_array[i] ) {
                    table_columns_array.push( item );
                }
            }else {
                let temp_arr = table_columns_array.concat();
                table_columns_array = [];
                for ( let item of temp_arr ) {
                    for ( let val of  column_items_array[i] ) {
                        if ( item instanceof Array ) {
                            let tempArr = Array.from(item);
                            table_columns_array.push(tempArr.concat([val]));
                        }else {
                            table_columns_array.push([item, val]);
                        }
                    }
                }
            }

        }

        // Preparing table rows
        let rows_length = tableConfiguration.rows.length;
        let row_items_array = [];
        for ( let i = 0; i < rows_length; i++ ) {
            let dimension = this.calculateColSpan (analyticsObject , tableConfiguration.rows, tableConfiguration.rows[i]);
            let currentRowItems = this.prepareSingleCategories( analyticsObject, tableConfiguration.rows[i] );
            row_items_array.push( {'items': currentRowItems, 'dimensions': dimension} );
        }
        let table_rows_array = [];
        for (let i = 0; i < row_items_array.length; i++ ) {
            if ( table_rows_array.length === 0 ) {
                for ( let item of row_items_array[i].items ) {
                    item.dimensions = row_items_array[i].dimensions;
                    table_rows_array.push( item );
                }
            }else {
                let temp_arr = table_rows_array.concat();
                table_rows_array = [];
                for ( let item of temp_arr ) {
                    for ( let val of  row_items_array[i].items ) {
                        val.dimensions = row_items_array[i].dimensions;
                        if ( item instanceof Array ) {
                            let tempArr = Array.from(item);
                            table_rows_array.push(tempArr.concat([val]));
                        }else {
                            table_rows_array.push([item, val]);
                        }
                    }
                }
            }

        }
        console.log(table_columns_array);

        let counter = 0;
        for ( let rowItem of table_rows_array ) {
            let item = {
                'items': [],
                'headers': rowItem
            };
            for (let val of rowItem ){
                if ( counter === 0 || counter % val.dimensions.col_span === 0) {
                    item.items.push( {'name': val.uid , 'val': val.name, 'row_span': val.dimensions.col_span} );
                }
            }
            for ( let colItem of table_columns_array ) {
                let dataItem = [];
                for (let val of rowItem ){ dataItem.push( {'type': val.type, 'value': val.uid} );  }
                for (let val of colItem ){ dataItem.push( {'type': val.type, 'value': val.uid} );  }
                item.items.push( {'name': '' , 'val': this.getDataValue( analyticsObject, dataItem ), 'row_span': '1', 'display': true} );
            }
            table.rows.push( item );
            counter++;
        }
        return table;
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

    chart_configuration_objects = {
        defaultChartObject: {
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
                    rotation: -90,
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
            series: []
        },

        stackedChartObject : {
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
                    enabled: true,
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
                        enabled: true
                    }
                }
            },
            series: []
        },

        barStackedObject : {
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
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: []
        },

        gaugeObject : {
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
        }
    };

}
