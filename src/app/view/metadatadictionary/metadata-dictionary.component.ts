import {Component, OnInit, Input} from '@angular/core';
import {Response, Http, Headers} from "@angular/http";
import {Observable} from "rxjs";

@Component({
    selector: 'app-metadata-dictionary',
  templateUrl: './metadata.html',
  styleUrls: ['./metadata.css']
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
