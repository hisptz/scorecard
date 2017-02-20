import {Component, OnInit, Input} from '@angular/core';
import {Response, Http, Headers} from "@angular/http";
import {Observable} from "rxjs";

@Component({
    selector: 'app-metadata-dictionary',
    template: `
  <div class="text-center" *ngIf="showingLoading">
        <img src="balls-4.svg" style="padding-top: 80px; height: 190px;">
        <p>{{progressMessage}}</p>
      </div>
  <!--If indicators-->
 <div class="panel-group" id="accordion" *ngIf="isIndicator">
  <div class="panel panel-default" *ngFor="let indicator of indicators let in = first;">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" data-parent="#accordion" href="#{{indicator.uid}}">
         {{indicator.name}}</a>
      </h4>
    </div>
    <div id="{{indicator.uid}}" class="panel-collapse collapse" [ngClass]="{ in: in }">
      <div class="panel-body">
      <h5 class="alert alert-info"> <span class="glyphicon glyphicon-hand-right"></span> {{indicator.name}} Introduction</h5>
      <p>An indicator is a formula that can consist of multiple data elements, constants, organisation unit group counts and mathematical operators. The indicator consist typically of a numerator and denominator. You use indicators to calculate coverage rates, incidence and other values that are a result of data element values that have been entered into the system. Calculated totals do not have a denominator</p>
      <p><strong>{{indicator.name}}</strong> Is of type <strong>{{indicator.indicatorType.name}}</strong> with numerator description of <strong>{{indicator.numeratorDescription}}</strong> and <span *ngIf="indicator.denominatorDescription!=''">denominator description of <strong>{{indicator.denominatorDescription}} </strong></span> having
      a numerator formula of <strong>({{indicator.numerator}})</strong> and denominator formula of  <strong>{{indicator.denominator}}</strong></p>
      <div *ngIf="indicator.dataSets && indicator.dataSets.length > 0">
       <h5 class="alert alert-info"> <span class="glyphicon glyphicon-hand-right"></span> {{indicator.name}} Sources</h5>
       <p>More than <strong>{{indicator.dataSets.length}}</strong> dataset ie <strong *ngFor="let dataset of indicator.dataSets">{{dataset.name}},</strong> use this {{indicator.name}} indicator which was created at <a href="#"  data-toggle="popover" title="Created by {{indicator.object.user?.displayName}}" style="cursor:pointer;background:0 0; color:#41b7d8; text-decoration:none;">{{ indicator.object.created | date }}
       </a> <span *ngIf="indicator.object.indicatorGroups && indicator.object.indicatorGroups.length > 0">and it belongs to <strong *ngFor="let indgroup of indicator.object.indicatorGroups">{{indgroup.name}} Group,</strong></span></p>
       <p *ngFor="let datasource of indicator.dataSets"><strong>{{datasource.name}}</strong> Data set with reporting frequency <strong>{{datasource.periodType }}</strong> which is only ontime when get collected before <b>{{datasource.timelyDays}} days</b> from the previous <span *ngIf="datasource.periodType=='Monthly'">Month</span><span *ngIf="datasource.periodType=='Quarterly'">Quarter</span> <span *ngIf="datasource.indicators && datasource.indicators.length > 0">and it has <strong>{{datasource.indicators.length}} Indicators</strong></span>,<span *ngIf="datasource.dataElements && datasource.dataElements.length > 0">and it has <strong>{{datasource.dataElements.length}} Dataelements</strong></span>
       <span *ngIf="datasource.organisationUnits && datasource.organisationUnits.length > 0">Like <strong>{{datasource.organisationUnits.length}} Health facilities report this form {{datasource.periodType }}</strong></span>
       </p>

      </div>
      </div>
    </div>
  </div>
 </div>
  <!--If data elements-->
 <div class="panel-group" id="accordion2" *ngIf="isDataelements">
  <div class="panel panel-default" *ngFor="let dataelement of dataelements let in = first;">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" data-parent="#accordion2" href="#{{dataelement.id}}">
         {{dataelement.name}}</a>
      </h4>
    </div>
    <div id="{{dataelement.id}}" class="panel-collapse collapse" [ngClass]="{ in: in }">
      <div class="panel-body">
      <h5 class="alert alert-info"><span class="glyphicon glyphicon-hand-right"></span> {{dataelement.name}} Introduction</h5>
      <p> This {{dataelement.name}} of this method of data aggregation <strong>{{dataelement.aggregationType}}</strong> created at <a class="text-success" title="Created by ">{{dataelement.created| date}}</a> is only taking <strong>{{dataelement.domainType}}</strong> data.As the culture of helping user not enntering unregnonized data,there fore its only taking <strong>{{dataelement.valueType}}</strong> values from the user input</p>
      <p *ngIf="dataelement.categoryCombo.name!='default'"><strong>{{dataelement.name}}</strong> consists of <strong>{{dataelement.categoryCombo.name}}</strong> category combitions of <strong *ngFor="let cat of dataelement.categoryCombo.categories let i = index">(<span *ngFor="let catoptions of cat.categoryOptions let j = index">{{catoptions.name}},</span>) of the {{cat.name}} Category, </strong></p>
      
      <div *ngIf="dataelement.dataSets && dataelement.dataSets.length > 0">
       <h5 class="alert alert-info"><span class="glyphicon glyphicon-hand-right"></span> {{dataelement.name}} Sources</h5>
       <p>More than <strong>{{dataelement.dataSets.length}}</strong> dataset ie <strong *ngFor="let dataset of dataelement.dataSets">{{dataset.name}},</strong> use this {{dataelement.name}} Data Element 
       <span *ngIf="dataelement.dataElementGroups && dataelement.dataElementGroups.length > 0">and it belongs to <strong *ngFor="let datgroup of dataelement.dataElementGroups">{{datgroup.name}} Group,</strong></span></p>
       <p *ngFor="let datasource of dataelement.dataSets"><strong>{{datasource.name}}</strong> Data set with reporting frequency <strong>{{datasource.periodType }}</strong> which is only ontime when get collected before <b>{{datasource.timelyDays}} days</b> from the previous <span *ngIf="datasource.periodType=='Monthly'">Month</span><span *ngIf="datasource.periodType=='Quarterly'">Quarter</span> <span *ngIf="datasource.indicators && datasource.indicators.length > 0">and it has <strong>{{datasource.indicators.length}} Indicators</strong></span>,<span *ngIf="datasource.dataElements && datasource.dataElements.length > 0">and it has <strong>{{datasource.dataElements.length}} Dataelements</strong></span>
       <span *ngIf="datasource.organisationUnits && datasource.organisationUnits.length > 0">Like <strong>{{datasource.organisationUnits.length}} Health facilities report this form {{datasource.periodType }}</strong></span>
       </p>

      </div>
      </div>
    </div>
  </div>
 </div>
 <!--If dataset-->
  <div class="panel-group" id="accordion3" *ngIf="isDataset">
  <div class="panel panel-default" *ngFor="let dataset of datasets let in = first;">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" data-parent="#accordion3" href="#{{dataset.id}}">
         {{dataset.name}}</a>
      </h4>
    </div>
    <div id="{{dataset.id}}" class="panel-collapse collapse" [ngClass]="{ in: in }">
      <div class="panel-body">
      <h5 class="alert alert-info"><span class="glyphicon glyphicon-hand-right"></span> {{dataset.name}} Introduction</h5>
      <p>{{dataset.name}} of the <strong>{{dataset.formType}}</strong> Form created at <a class="text-success" title="Created by {{dataset.user.name}}">{{dataset.created| date}}</a> <span *ngIf="dataset.categoryCombo.name!='default'"> With <strong>{{dataset.categoryCombo.name}}</strong> Dimension which is divided into <strong *ngFor=" let cat of dataset.categoryCombo.categories"><span *ngFor="let opt of cat.categoryOptions"> {{opt.name}}, </span></strong></span></p>
      <p><strong>{{dataset.name}}</strong> Data set with reporting frequency <strong>{{dataset.periodType }}</strong> which is only ontime when get collected before <strong>{{dataset.timelyDays}} days</strong> from the previous <span *ngIf="dataset.periodType=='Monthly'">Month</span><span *ngIf="dataset.periodType=='Quarterly'">Quarter</span> <span *ngIf="dataset.indicators && dataset.indicators.length > 0">and it has <strong>{{dataset.indicators.length}} Indicators</strong></span>,<span *ngIf="dataset.dataElements && dataset.dataElements.length > 0">and it has <strong>{{dataset.dataElements.length}} Dataelements</strong></span>
       <span *ngIf="dataset.organisationUnits && dataset.organisationUnits.length > 0">Like <strong>{{dataset.organisationUnits.length}} Health facilities report this form {{dataset.periodType }}</strong></span>
     </p>
      </div>
    </div>
  </div>
  </div>
   <!--If events-->
  <div class="panel-group" id="accordion4" *ngIf="isEvents">
   <div class="panel panel-default" *ngFor="let event of events let in = first;">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" data-parent="#accordion4" href="#{{event.id}}">
         {{event.name}}</a>
      </h4>
    </div>
    <div id="{{event.id}}" class="panel-collapse collapse" [ngClass]="{ in: in }">
      <div class="panel-body">
      <h5 class="alert alert-info"><span class="glyphicon glyphicon-hand-right"></span> {{event.name}} Introduction</h5>
      <p *ngIf="event.programType=='WITHOUT_REGISTRATION'">{{event.name}} This is a single events without registration program(anonymous program or SEWoR) its used for serving health cases without registering any information into the system. This {{event.name}} have only one stage called <strong *ngFor="let stage of event.programStages">{{stage.name}}</strong> Normally this stage defines which actions should be taken at each stage </p>
      <p><strong>{{event.name}}</strong> Program with <strong *ngFor="let stage of event.programStages">{{stage.name }}</strong> have nearly <strong *ngFor="let stage of event.programStages"><span *ngIf="stage.programStageDataElements && stage.programStageDataElements.length >0">{{stage.programStageDataElements.length}} Data Elements</span></strong>  <span *ngIf="event.programIndicators && event.programIndicators.length >0"> and <strong>{{event.programIndicators.length}} Program Indicators</strong> Which is the expression based on dataelements and attributes of the tracked entities which can be used to calculate values based on the formula</span></p>
      </div>
    </div>
  </div>
 </div>
  <!--If program Indicators-->
 <div class="panel-group" id="accordion5" *ngIf="isProgramInd">
   <div class="panel panel-default" *ngFor="let prog of programInd let in = first;">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" data-parent="#accordion5" href="#{{prog.object.id}}">
         {{prog.object.name}}</a>
      </h4>
    </div>
    <div id="{{prog.object.id}}" class="panel-collapse collapse" [ngClass]="{ in: in }">
      <div class="panel-body">
      <h5 class="alert alert-info"><span class="glyphicon glyphicon-hand-right"></span> {{prog.object.name}} Introduction</h5>
      <p><strong>{{prog.object.name}} </strong> Program Indicator.This is expressions based on data elements and attributes of tracked entities which can be used to calculate values based on a formula.Program indicators consist of an aggregation type of <strong>{{prog.object.aggregationType}}</strong>,an expression of <strong>{{prog.expressionName}}</strong> and filter of <strong>{{prog.filterName}}</strong></p>
      <p>This <strong>{{prog.object.name}}</strong> Program Indicator is evaluated based on the assigned aggregation type,The order of evaluation is as follows </p>
      <p *ngIf="prog.filterName">1.This <strong>{{prog.filterName}}</strong> filter will filter the events which become part of the evaluation / aggregation routine.</p>
      <p *ngIf="prog.expressionName">2.This <strong>{{prog.expressionName}}</strong> expression will be evaluated per event.</p>
      <p>3.<strong>{{prog.object.aggregationType}}</strong> All evaluated expression values will be aggregated according to the aggregation type of the program indicator.</p>
      </div>
    </div>
  </div>
 </div>
 `,
    styleUrls: [`
       a:active,a:hover,a:focus{
         text-decoration:none !important
        }
        
   `]
})
export class MetadataDictionaryComponent implements OnInit {
    private indicators=[];
    private dataelements=[];
    private datasets=[];
    private events=[];
    private programInd=[];
    private isIndicator=false;
    private isDataelements=false;
    private isDataset=false;
    private isEvents=false;
    private isProgramInd=false;
    private showingLoading:boolean=false;
    private progressMessage:string="Preparing metadata dictionary"
    @Input() metadataidentifiers:string;

    constructor(private http:Http) {
        this.indicators=[];
        this.dataelements=[];
        this.datasets=[];
        this.events=[];
        this.programInd=[];
    }

    ngOnInit() {
        //console.log(this.metadataidentifiers);
        const uid=this.metadataidentifiers;
        console.log(this.metadataFromAnalyticsLink(uid));
        this.displayDetail(uid)

    }
    displayDetail(uid){
        this.showingLoading=true;
        var self=this.http;
        this.metadataFromAnalyticsLink(uid).forEach(value => {
            self.get('../../../api/identifiableObjects/'+value+'.json')
                .map((response:Response)=>response.json())
                .subscribe(data=>{
                    const metadataLink=data.href;
                    if (metadataLink.indexOf("indicators")>=1){
                        const indicatorUrl=metadataLink+'.json?fields=:all,displayName,id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],attributeValues[value,attribute[name]],indicatorGroups[name,indicators~size],legendSet[name,symbolizer,legends~size],dataSets[name]';
                        self.get(indicatorUrl)
                            .map((res:Response)=>res.json())
                            .subscribe(data=>{
                                    let indicatorObject=data;
                                    self.get('../../../api/expressions/description?expression='+encodeURIComponent(data.numerator))
                                        .subscribe((numExp:Response)=>{
                                                let  numerator=numExp.json().description;
                                                self.get('../../../api/expressions/description?expression='+encodeURIComponent(data.denominator))
                                                    .subscribe((denoExp:Response)=>{
                                                        let denominator=denoExp.json().description;
                                                        this.indicators.push({object:indicatorObject,name:indicatorObject.name,uid:indicatorObject.id,denominatorDescription:indicatorObject.denominatorDescription,numeratorDescription:indicatorObject.numeratorDescription,numerator:numerator,denominator:denominator,indicatorType:indicatorObject.indicatorType,dataSets:indicatorObject.dataSets,numeratorForm:indicatorObject.numerator,demonitorForm:indicatorObject.denominator});
                                                        //=indicators
                                                        console.log(this.indicators)// It brings undefined
                                                    })

                                            }
                                        )
                                    this.progressMessage="Organising extracted metadata dictionary"
                                },
                                error=>{
                                    this.progressMessage="Sorry we are still looking what might be wrong"
                                },
                                ()=>{
                                    this.progressMessage="Metadata dictionary ready for consumption"
                                }

                            )
                        this.showingLoading=false;
                        this.isIndicator=true
                    }else if(metadataLink.indexOf("dataElements")>=1){
                        const dataelementUrl=metadataLink+'.json?fields=:all,id,name,aggregationType,displayName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSets[:all,!compulsoryDataElementOperands]'
                        self.get(dataelementUrl)
                            .map((res:Response)=>res.json())
                            .subscribe(dataelement=>{
                                    this.dataelements.push(dataelement);
                                    console.log(this.dataelements)// It brings undefined
                                },
                                error=>{
                                    this.progressMessage="Sorry we are still looking what might be wrong"
                                },
                                ()=>{
                                    this.progressMessage="Metadata dictionary ready for consumption"
                                }
                            )
                        this.isDataelements=true;
                        this.showingLoading=false
                    }else if(metadataLink.indexOf("dataSets")>=1){
                        const datasetUrl=metadataLink+'.json?fields=:all,user[:all],id,name,periodType,shortName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]'
                        self.get(datasetUrl)
                            .map((res:Response)=>res.json())
                            .subscribe(dataset=>{
                                    this.datasets.push(dataset)
                                    console.log(this.datasets)// It brings undefined
                                },
                                error=>{
                                    this.progressMessage="Sorry we are still looking what might be wrong"
                                },
                                ()=>{
                                    this.progressMessage="Metadata dictionary ready for consumption"
                                }
                            )
                        this.isDataset=true;
                        this.showingLoading=false
                    }else if(metadataLink.indexOf("programs")>=1){
                        const eventUrl=metadataLink+'.json?fields=:all,programStages[:all,programStageDataElements[:all]]'
                        self.get(eventUrl)
                            .map((res:Response)=>res.json())
                            .subscribe(event=>{
                                    this.events.push(event)
                                    console.log(this.events)
                                },
                                error=>{
                                    this.progressMessage="Sorry we are still looking what might be wrong"
                                },
                                ()=>{
                                    this.progressMessage="Metadata dictionary ready for consumption"
                                }
                            )
                        this.isEvents=true;
                        this.showingLoading=false
                    }else if(metadataLink.indexOf("programIndicators")>=1){
                        const programUrl=metadataLink+'.json?fields=:all,user[:all],program[:all]'
                        self.get(programUrl)
                            .map((res:Response)=>res.json())
                            .subscribe(progInd=>{
                                    var headers = new Headers();
                                    headers.append('Content-Type', 'application/json;charset=UTF-8');
                                    const url='../../../api/programIndicators/filter/description';
                                    const expr='../../../api/programIndicators/expression/description';
                                    if(progInd.hasOwnProperty('filter')){
                                        this.http.post(url,progInd.filter,{headers:headers})
                                            .map((res:Response)=>res.json())
                                            .subscribe(
                                                data=>{
                                                    this.http.post(expr, progInd.expression, {headers: headers})
                                                        .map((res: Response)=>res.json())
                                                        .subscribe(
                                                            expres=> {
                                                                this.programInd.push({
                                                                    object: progInd,
                                                                    filterName: data.description,
                                                                    expressionName: expres.description
                                                                })
                                                                console.log(this.programInd)
                                                            },
                                                            error=> {
                                                                this.progressMessage = "Sorry we are still looking what might be wrong"
                                                            },
                                                            ()=> {
                                                                this.progressMessage = "Metadata dictionary ready for consumption"
                                                            }
                                                        )

                                                }

                                            )
                                    }else{
                                        this.http.post(expr, progInd.expression, {headers: headers})
                                            .map((res: Response)=>res.json())
                                            .subscribe(
                                                expres=> {
                                                    this.programInd.push({
                                                        object: progInd,
                                                        expressionName: expres.description
                                                    })
                                                    console.log(this.programInd)
                                                },
                                                error=> {
                                                    this.progressMessage = "Sorry we are still looking what might be wrong"
                                                },
                                                ()=> {
                                                    this.progressMessage = "Metadata dictionary ready for consumption"
                                                }
                                            )
                                    }
                                },
                                error=>{
                                    this.progressMessage="Sorry we are still looking what might be wrong"
                                },
                                ()=>{
                                    this.progressMessage="Metadata dictionary ready for consumption"
                                }
                            )
                        this.isProgramInd=true;
                        this.showingLoading=false
                    }

                })
        })
    }
    getIndicatorProgramFilterExpression(filterExpression){

    }
    metadataFromAnalyticsLink(dx){
        var separatedx=[]
        if(dx.indexOf(';')>=1){
            dx.split(';').forEach(data=>{
                if(data.indexOf('.')>=1){
                    if(separatedx.indexOf(data.split('.')[0])!=-1){
                    }else{
                        separatedx.push(data.split('.')[0])
                    }
                }else {
                    separatedx.push(data)
                }
            })
        }else{
            if(dx.indexOf('.')>=1){
                separatedx.push(dx.split('.')[0]);
            }else{
                separatedx.push(dx);
            }

        }
        return separatedx;

    }
    private HandleError(error:any){
        let errMsg:string;
        if( error instanceof Response){
            const body=error.json()|| '';
            const err=body.error || JSON.stringify(body)
            errMsg=`${error.status}-${error.statusText || ''} ${err}`
        }else{
            errMsg=error.message? error.message:error.string();
        }
        console.log(errMsg);
        return Observable.throw(errMsg)
    }
}
