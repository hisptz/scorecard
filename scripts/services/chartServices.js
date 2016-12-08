var chartServices = angular.module('chartServices',['ngResource']);

chartServices.factory('chartsManager',function($timeout){
    'use strict';

    var chartsManager = {
        data: '',
        defaultChartObject: {
            options : {
                title: {
                    text: ''
                },
                chart: {
                    events: {
                        load: function(chart) {
                            $timeout(function() {
                                chart.target.reflow();

                            },0 );
                        }
                    }
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
                }
            },
            series: []
        },

        stackedChartObject : {
            options :{
                chart: {
                    type: 'column',
                    events: {
                        load: function(chart) {
                            $timeout(function() {
                                chart.target.reflow();

                            },0 );
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
                }
            },
            series: []
        },

        barStackedObject : {
            options: {
                chart: {
                    type: 'bar',
                    events: {
                        load: function(chart) {
                            $timeout(function() {
                                chart.target.reflow();

                            },0 );
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
                }
            },
            series: []
        },


        gaugeObject : {
            options: {
                chart: {
                    type: 'solidgauge',
                    events: {
                        load: function(chart) {
                            $timeout(function() {
                                chart.target.reflow();

                            },0 );
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
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
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
                }


            },
            series: []
        },
        //determine the position of metadata using prefix [dx,de,co,pe,ou]
        getTitleIndex: function(analyticsObjectHeaders,name){
            var index = 0;
            var counter = 0;
            angular.forEach(analyticsObjectHeaders,function(header){
                if(header.name === name){
                    index = counter;
                }
                counter++;
            });
            return index;
        },

        //get an array of items from analyticsObject[metadataType == dx,co,ou,pe,value]
        getMetadataArray : function (analyticsObject,metadataType) {
            //determine the position of metadata in rows of values
            var index = this.getTitleIndex(analyticsObject.headers,metadataType);
            var metadataArray = [];
            var checkArr = [];
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
        },

        //get an array of items from analyticsObject[metadataType == dx,co,ou,pe,value]
        getDetailedMetadataArray : function (analyticsObject,metadataType) {
            //determine the position of metadata in rows of values
            var metadataArray = [];
            if(metadataType === 'dx'){
                angular.forEach(analyticsObject.metaData.dx,function(value){
                    metadataArray.push({id:value,name:analyticsObject.metaData.names[value]})
                });
            }else if(metadataType === 'ou'){
                angular.forEach(analyticsObject.metaData.ou,function(value){
                    metadataArray.push({id:value,name:analyticsObject.metaData.names[value]})
                });
            }else if(metadataType === 'co'){
                angular.forEach(analyticsObject.metaData.co,function(value){
                    metadataArray.push({id:value,name:analyticsObject.metaData.names[value]})
                });
            }else if(metadataType === 'pe'){
                angular.forEach(analyticsObject.metaData.pe,function(value){
                    metadataArray.push({id:value,name:analyticsObject.metaData.names[value]})
                });
            }else{
                metadataArray = []
            }

            return metadataArray;
        },

        //preparing categories depending on selections
        //return the meaningfull array of xAxis and yAxis Items
        //x axisItems and yAxisItems are specified if you want few data type array['uid1','uid2']
        prepareCategories : function(analyticsObject,xAxis,xAxisItems,yAxis,yAxisItems){
            var structure = {'xAxisItems':[],'yAxisItems':[]};
            if(xAxisItems.length === 0){
                angular.forEach(this.getMetadataArray(analyticsObject,xAxis),function(val){
                    structure.xAxisItems.push({'name':analyticsObject.metaData.names[val],'uid':val});
                });
            }if(xAxisItems.length !== 0){
                angular.forEach(xAxisItems,function(val){
                    structure.xAxisItems.push({'name':analyticsObject.metaData.names[val],'uid':val});
                });
            }if(yAxisItems.length !== 0){
                angular.forEach(yAxisItems,function(val){
                    structure.yAxisItems.push({'name':analyticsObject.metaData.names[val],'uid':val});
                });
            }if(yAxisItems.length === 0){
                angular.forEach(this.getMetadataArray(analyticsObject,yAxis),function(val){
                    structure.yAxisItems.push({'name':analyticsObject.metaData.names[val],'uid':val});
                });

            }

            return structure;

        },

        //preparing categories depending on selections
        //return the meaningfull array of single selection only
        //items are specified if you want few data type array['uid1','uid2']
        prepareSingleCategories : function(analyticsObject,xAxis,xAxisItems){
            var structure = [];
            if(xAxisItems.length === 0){
                angular.forEach(this.getMetadataArray(analyticsObject,xAxis),function(val){
                    structure.push({'name':analyticsObject.metaData.names[val],'uid':val});
                });
            }if(xAxisItems.length !== 0){
                angular.forEach(xAxisItems,function(val){
                    structure.push({'name':analyticsObject.metaData.names[val],'uid':val});
                });
            }
            return structure;

        },

        //try to find data from the rows of analytics object
        getDataValue : function(analyticsObject,xAxisType,xAxisUid,yAxisType,yAxisUid,filterType,filterUid){
            var num = 0;
            var currentService = this;
            $.each(analyticsObject.rows,function(key,value){
                if(filterType === 'none'){
                    if(value[currentService.getTitleIndex(analyticsObject.headers,yAxisType)] === yAxisUid &&
                        value[currentService.getTitleIndex(analyticsObject.headers,xAxisType)] === xAxisUid ){
                        num = parseFloat(value[currentService.getTitleIndex(analyticsObject.headers,'value')]);
                    }
                }else{

                    if(value[currentService.getTitleIndex(analyticsObject.headers,yAxisType)] === yAxisUid &&
                        value[currentService.getTitleIndex(analyticsObject.headers,xAxisType)] === xAxisUid &&
                        value[currentService.getTitleIndex(analyticsObject.headers,filterType)] === filterUid ){
                        num = parseFloat(value[currentService.getTitleIndex(analyticsObject.headers,'value')]);
                    }
                }

            });
            return num;
        },

        //drawing some charts
        drawChart : function(analyticsObject,xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,type) {
            var currentService = this;
            switch (type){
                case 'bar':
                    return currentService.drawOtherCharts(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, 'bar');
                    break;
                case 'column':
                    return currentService.drawOtherCharts(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, 'column');
                    break;
                case 'radar':
                    return currentService.drawSpiderChart(analyticsObject,  xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, type);
                    break;
                case 'stacked_column':
                    return currentService.drawStackedChart(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, 'column');
                    break;
                case 'stacked_bar':
                    return currentService.drawStackedChart(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, 'bar');
                    break;
                case 'gauge':
                    return currentService.drawGaugeChart(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, 'bar');
                    break;
                case 'combined':
                    return currentService.drawCombinedChart(analyticsObject,  xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title);
                    break;
                case 'line':
                    return currentService.drawOtherCharts(analyticsObject,  xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, type);
                    break;
                case 'pie':
                    return currentService.drawPieChart(analyticsObject,  xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title);
                    break;
                case 'table':
                    return currentService.drawTable(analyticsObject,  xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title);
                    break;
                default :
                    return currentService.drawOtherCharts(analyticsObject,  xAxisType,xAxisItems,yAxisType,yAxisItems, filterType, filterUid, title, type);
                    break;
            }
        },

        drawTable : function(analyticsObject, yAxisType,yAxisItems,xAxisType,xAxisItems,filterType,filterUid,title){
            var chartService = this;
            var table="<thead><tr><th></th>";
            angular.forEach(chartService.prepareSingleCategories(analyticsObject,xAxisType,xAxisItems),function(column){
                table+="<th>"+column.name+"</th>";
            });
            table+="</tr></thead><tbody>";
            angular.forEach(chartService.prepareSingleCategories(analyticsObject,yAxisType,yAxisItems),function(row){
                table+="<tr><td>"+row.name+"</td>";
                angular.forEach(chartService.prepareSingleCategories(analyticsObject,xAxisType,xAxisItems),function(column){
                    table+="<td>"+chartService.getDataValue(analyticsObject,xAxisType,column.uid,yAxisType,row.uid,filterType,filterUid)+"</td>";
                });
                table+="</tr>";
            })
            table+="</tbody>";
            return table;

        },
        //hacks for pie chart
        drawPieChart1 : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title){

            var chartObject = angular.copy(this.defaultChartObject);
            chartObject.options.title.text = title;

            //chartObject.yAxis.title.text = title.toLowerCase();
            var pieSeries = [];
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            var serie = [];
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    serie.push({name: yAxis.name+' - '+ xAxis.name , y: parseFloat(number)});
                });
            });
            chartObject.series.push({type: 'pie', name:title , data: serie,showInLegend: true,
                dataLabels: {
                    enabled: false
                } });
            return chartObject;
        },

        //hack for combined charts
        drawCombinedChart : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title){
            var chartObject = angular.copy(this.defaultChartObject);
            chartObject.options.title.text = title;
            //chartObject.yAxis.title.text = title.toLowerCase();
            var pieSeries = [];
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            //set x-axis categories
            angular.forEach(metaDataObject.xAxisItems, function (val) {
                chartObject.options.xAxis.categories.push(val.name);
            });
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                var barSeries = [];
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    barSeries.push(parseFloat(number));
                    pieSeries.push({name: yAxis.name+' - '+ xAxis.name , y: parseFloat(number) });
                });
                chartObject.series.push({type: 'column', name: yAxis.name, data: barSeries});
                chartObject.series.push({type: 'spline', name: yAxis.name, data: barSeries});
            });


            return chartObject;
        },

        //draw all other types of chart[bar,line,area]
        drawOtherCharts : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,chartType){
            var chartObject = angular.copy(this.defaultChartObject);
            if(chartType == 'bar'){
                chartObject.options.chart.type = chartType;
                chartObject.options.xAxis.labels.rotation = 0;
            }
            chartObject.options.title.text = title;
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            angular.forEach(metaDataObject.xAxisItems, function (val) {
                chartObject.options.xAxis.categories.push(val.name);
            });
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                var chartSeries = [];
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    chartSeries.push(parseFloat(number));
                });
                chartObject.series.push({type: chartType, name: yAxis.name, data: chartSeries});
            });
            return chartObject;
        },

        //draw all other types of chart[bar,line,area]
        drawStackedChart : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,stackingType){

            var chartObject = (stackingType == 'bar')?angular.copy(this.barStackedObject):angular.copy(this.stackedChartObject);
            chartObject.options.title.text = title;
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            angular.forEach(metaDataObject.xAxisItems, function (val) {
                chartObject.options.xAxis.categories.push(val.name);
            });
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                var chartSeries = [];
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    chartSeries.push(parseFloat(number));
                });
                chartObject.series.push({ name: yAxis.name, data: chartSeries});
            });
            return chartObject;
        },

        //get a spider chart
        drawSpiderChart : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,chartType){
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            var categories = [];
            angular.forEach(metaDataObject.xAxisItems, function (val) {
                categories.push(val.name);
            });

            var series = [];
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                var chartSeries = [];
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    chartSeries.push(parseFloat(number));
                });
                series.push({name: yAxis.name, data: chartSeries, pointPlacement: 'on'});
            });
            var chartObject = {
                options: {
                    chart: {
                        polar: true,
                        type: 'area',
                        events: {
                            load: function(chart) {
                                $timeout(function() {
                                    chart.target.reflow();

                                },0 );
                            }
                        }
                    },

                    title: {
                        text: title,
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
                    }
                },
                series: series

            };
            return chartObject;
        },

        CSS_COLOR_NAMES : ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
            '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1','#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
            '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a','#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
            '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92','#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
            '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1','#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
            '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a','#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
            '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],

        //draw all other types of chart[bar,line,area]
        drawPieChart : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,chartType){


            var chartObject = {};
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            var categories = [];
            var data = [];
            var color = 0;
            angular.forEach(metaDataObject.xAxisItems, function (val) {
                color++;
                categories.push(val.name);
                var chartSeries = [];
                var subcategories = [];
                var sumCategory = 0;
                angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,val.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    chartSeries.push(parseFloat(number));
                    sumCategory += parseFloat(number);
                    subcategories.push(yAxis.name);
                });
                data.push({
                    y: sumCategory,
                    color: currentService.CSS_COLOR_NAMES[color],
                    drilldown: {
                        name: val.name,
                        categories: subcategories,
                        data: chartSeries,
                        color: currentService.CSS_COLOR_NAMES[color]
                    }
                })

            });

            var baseData = [],
                versionsData = [],
                i,
                j,
                dataLen = data.length,
                drillDataLen,
                brightness;


            // Build the data arrays
            for (i = 0; i < dataLen; i += 1) {

                // add browser data
                baseData.push({
                    name: categories[i],
                    y: data[i].y,
                    color: data[i].color
                });

                // add version data
                drillDataLen = data[i].drilldown.data.length;
                for (j = 0; j < drillDataLen; j += 1) {
                    brightness = 0.2 - (j / drillDataLen) / 5;
                    versionsData.push({
                        name: data[i].drilldown.categories[j],
                        y: data[i].drilldown.data[j],
                        color: data[i].color
                    });
                }
            }

            chartObject = {
                options:{
                    chart: {
                        type: 'pie'
                    },
                    title: {
                        text: title
                    },
                    yAxis: {
                        title: {
                            text: ''
                        }
                    },
                    plotOptions: {
                        pie: {
                            shadow: false,
                            center: ['50%', '50%']
                        }
                    },
                    tooltip: {
                        valueSuffix: '%'
                    }
                },
                series: [{
                    name: '',
                    data: baseData,
                    size: '60%',
                    dataLabels: {
                        formatter: function () {
                            return this.y > 5 ? this.point.name : null;
                        },
                        color: '#ffffff',
                        distance: -30
                    }
                }, {
                    name: '',
                    data: versionsData,
                    size: '80%',
                    innerSize: '60%',
                    dataLabels: {
                        formatter: function () {
                            // display only if larger than 1
                            return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                        }
                    }
                }]
            };


            return chartObject;
        },

        //get a spider chart
        drawRoseChart : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,chartType){
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            var categories = [];
            angular.forEach(metaDataObject.xAxisItems, function (val) {
                categories.push(val.name);
            });

            var series = [];
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                var chartSeries = [];
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    chartSeries.push(parseFloat(number));
                });
                series.push({name: yAxis.name, data: chartSeries, pointPlacement: 'on'});
            });
            var chartObject = {
                options: {
                    chart: {
                        polar: true,
                        type: 'area'
                    },

                    title: {
                        text: title,
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
                    }
                },
                series: series

            };
            return chartObject;
        },

        drawGaugeChart : function(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems,filterType,filterUid,title,chartType){
            var chartObject = angular.copy(this.gaugeObject);
            chartObject.options.title.text = title;
            var metaDataObject = this.prepareCategories(analyticsObject, xAxisType,xAxisItems,yAxisType,yAxisItems);
            var currentService = this;
            var gaugeValue  = 0;
            angular.forEach(metaDataObject.yAxisItems,function(yAxis){
                var chartSeries = [];
                angular.forEach(metaDataObject.xAxisItems,function(xAxis){
                    var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
                    chartSeries.push(parseFloat(number));
                    gaugeValue = parseFloat(number);
                    console.log(gaugeValue);
                });
                //chartObject.series.push({type: chartType, name: yAxis.name, data: chartSeries});
            });
            chartObject.series = [];
            chartObject.series.push({
                name: title,
                data: [gaugeValue],
                tooltip: {
                    valueSuffix: ' '
                }
            });
            return chartObject;
        }

    };
    return chartsManager;
});
