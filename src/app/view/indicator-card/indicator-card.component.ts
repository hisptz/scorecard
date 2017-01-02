import {Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {FilterService} from "../../shared/services/filter.service";
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {VisulizerService} from "../ng2-dhis-visualizer/visulizer.service";
import {Constants} from "../../shared/costants";
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs';
import { Subscription } from 'rxjs/Rx';

const actionMapping:IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    click: (node, tree, $event) => TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
  }
};

@Component({
  selector: 'indicator-card',
  templateUrl: './indicator-card.component.html',
  styleUrls: ['./indicator-card.component.css']
})
export class IndicatorCardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() orgunit_nodes: any = [];
  @Input() current_year: any;
  @Input() current_period_type: any;
  @Input() indicator:any;
  @Input() default_period:any;
  @Input() default_period_type:any;
  @Input() default_orgunit:any;
  @Output() show_details = new EventEmitter<any>();
  card_orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: "Select Organisation Unit"
  };

  card_period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: true,
    placeholder: "Select period"
  };
  card_organisationunits: any[] = [];
  card_periods: any[] = [];
  card_selected_orgunits: any[] = [];
  card_selected_periods:any[] = [];
  card_period_type: string = "Quarterly";
  card_year: any;
  showOrgTree:boolean = true;
  showPerTree:boolean = true;

  card_orgUnit: any;
  card_period: any;

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('pertree')
  pertree: TreeComponent;

  private subscription: Subscription;

  loading: boolean = false;

  sampledata = {"headers":[{"name":"dx","column":"Data","type":"java.lang.String","hidden":false,"meta":true},{"name":"ou","column":"Organisation unit","type":"java.lang.String","hidden":false,"meta":true},{"name":"pe","column":"Period","type":"java.lang.String","hidden":false,"meta":true},{"name":"value","column":"Value","type":"java.lang.Double","hidden":false,"meta":false}],"metaData":{"names":{"RD96nI1JXVV":"Kigoma Region","FumHFC1J66L":"Death Rate Perinatal","LGTVRhKSn1V":"Singida Region","EO3Ps3ny0Nr":"Shinyanga Region","MAL4cfZoFhJ":"Geita Region","A3b5mw8DJYC":"Mbeya Region","DWSo42hunXH":"Katavi Region","hAFRrgDK0fy":"Mwanza Region","yGWlpZdYuKv":"Dispensaries","Xaj6TFnz6sT":"Clinics","YDGD2VlXkJG":"Hospitals","Rg0jCRi9297":"Songwe Region","dx":"Data","vAtZ8a924Lx":"Rukwa Region","Cpd5l15XxwA":"Dodoma Region","sWOWPBvwNY2":"Iringa Region","vYT08q7Wo33":"Mara Region","Crkg9BoUo5w":"Kagera Region","yyW17iCz9As":"Pwani Region","acZHYslyJLt":"Dar Es Salaam Region","qg5ySBw9X5l":"Manyara Region","bzTuXoKa87E":"Maternal Mortality Ratio (Institutional)","ou":"Organisation unit","bN5q5k5DgLA":"Mtwara Region","2015Q4":"Oct to Dec 2015","LYL0E9cqKLn":"Health Centres","lnOyHhoLzre":"Kilimanjaro Region","kZ6RlMnt2bp":"Tabora Region","hk8DwZuW4Ay":"ACT_Number of children (<15) tested for HIV","TRoamv0YPt3":"ANC 1st Visit Before 12 weeks rate","qarQhOt2OEh":"Njombe Region","2016Q1":"Jan to Mar 2016","Gk33rUTrPL5":"ACT_Testing by age categories","vU0Qt1A5IDz":"Tanga Region","m5WIYYiOtSp":"ACT_Number of children tested +VE (<15)","YtVMnut7Foe":"Arusha Region","VMgrQWSVIYn":"Lindi Region","qN1zFaX9mVe":"Jumla Hudhurio la Kwanza","Sj50oz9EHvD":"Morogoro Region","pe":"Period","IgTAEKMqKRe":"Simiyu Region","jjmSfPm3dJk":"ANC HIV+ given ARV rate","m0frOspS7JY":"MOH - Tanzania","vfaY7k6TINl":"ANC Malaria prevalence","HkhBsvPXUqi":"Death Rate Neonatal - Pilot HMIS","ZYYX8Q9SGoV":"Ruvuma Region"},"dx":["m5WIYYiOtSp","Gk33rUTrPL5","hk8DwZuW4Ay","vfaY7k6TINl","jjmSfPm3dJk","TRoamv0YPt3","qN1zFaX9mVe","FumHFC1J66L","bzTuXoKa87E","HkhBsvPXUqi","Xaj6TFnz6sT","YDGD2VlXkJG","yGWlpZdYuKv","LYL0E9cqKLn"],"pe":["2016Q1","2015Q4"],"ou":["m0frOspS7JY","lnOyHhoLzre","LGTVRhKSn1V","vU0Qt1A5IDz","ZYYX8Q9SGoV","DWSo42hunXH","bN5q5k5DgLA","YtVMnut7Foe","A3b5mw8DJYC","kZ6RlMnt2bp","Rg0jCRi9297","vAtZ8a924Lx","vYT08q7Wo33","yyW17iCz9As","qg5ySBw9X5l","RD96nI1JXVV","VMgrQWSVIYn","acZHYslyJLt","MAL4cfZoFhJ","Cpd5l15XxwA","hAFRrgDK0fy","Sj50oz9EHvD","sWOWPBvwNY2","IgTAEKMqKRe","qarQhOt2OEh","Crkg9BoUo5w","EO3Ps3ny0Nr"],"co":[]},"rows":[["m5WIYYiOtSp","m0frOspS7JY","2016Q1","5206.0"],["m5WIYYiOtSp","m0frOspS7JY","2015Q4","3424.0"],["m5WIYYiOtSp","lnOyHhoLzre","2016Q1","108.0"],["m5WIYYiOtSp","lnOyHhoLzre","2015Q4","65.0"],["m5WIYYiOtSp","LGTVRhKSn1V","2016Q1","56.0"],["m5WIYYiOtSp","LGTVRhKSn1V","2015Q4","30.0"],["m5WIYYiOtSp","vU0Qt1A5IDz","2016Q1","261.0"],["m5WIYYiOtSp","vU0Qt1A5IDz","2015Q4","109.0"],["m5WIYYiOtSp","ZYYX8Q9SGoV","2016Q1","116.0"],["m5WIYYiOtSp","ZYYX8Q9SGoV","2015Q4","127.0"],["m5WIYYiOtSp","DWSo42hunXH","2016Q1","55.0"],["m5WIYYiOtSp","DWSo42hunXH","2015Q4","45.0"],["m5WIYYiOtSp","bN5q5k5DgLA","2016Q1","109.0"],["m5WIYYiOtSp","bN5q5k5DgLA","2015Q4","256.0"],["m5WIYYiOtSp","YtVMnut7Foe","2016Q1","97.0"],["m5WIYYiOtSp","YtVMnut7Foe","2015Q4","96.0"],["m5WIYYiOtSp","A3b5mw8DJYC","2016Q1","317.0"],["m5WIYYiOtSp","A3b5mw8DJYC","2015Q4","265.0"],["m5WIYYiOtSp","kZ6RlMnt2bp","2016Q1","287.0"],["m5WIYYiOtSp","kZ6RlMnt2bp","2015Q4","191.0"],["m5WIYYiOtSp","Rg0jCRi9297","2016Q1","96.0"],["m5WIYYiOtSp","Rg0jCRi9297","2015Q4","65.0"],["m5WIYYiOtSp","vAtZ8a924Lx","2016Q1","75.0"],["m5WIYYiOtSp","vAtZ8a924Lx","2015Q4","71.0"],["m5WIYYiOtSp","vYT08q7Wo33","2016Q1","215.0"],["m5WIYYiOtSp","vYT08q7Wo33","2015Q4","64.0"],["m5WIYYiOtSp","yyW17iCz9As","2016Q1","375.0"],["m5WIYYiOtSp","yyW17iCz9As","2015Q4","135.0"],["m5WIYYiOtSp","qg5ySBw9X5l","2016Q1","43.0"],["m5WIYYiOtSp","qg5ySBw9X5l","2015Q4","34.0"],["m5WIYYiOtSp","RD96nI1JXVV","2016Q1","46.0"],["m5WIYYiOtSp","RD96nI1JXVV","2015Q4","29.0"],["m5WIYYiOtSp","VMgrQWSVIYn","2016Q1","43.0"],["m5WIYYiOtSp","VMgrQWSVIYn","2015Q4","62.0"],["m5WIYYiOtSp","acZHYslyJLt","2016Q1","806.0"],["m5WIYYiOtSp","acZHYslyJLt","2015Q4","419.0"],["m5WIYYiOtSp","MAL4cfZoFhJ","2016Q1","191.0"],["m5WIYYiOtSp","MAL4cfZoFhJ","2015Q4","102.0"],["m5WIYYiOtSp","Cpd5l15XxwA","2016Q1","111.0"],["m5WIYYiOtSp","Cpd5l15XxwA","2015Q4","92.0"],["m5WIYYiOtSp","hAFRrgDK0fy","2016Q1","468.0"],["m5WIYYiOtSp","hAFRrgDK0fy","2015Q4","110.0"],["m5WIYYiOtSp","Sj50oz9EHvD","2016Q1","136.0"],["m5WIYYiOtSp","Sj50oz9EHvD","2015Q4","158.0"],["m5WIYYiOtSp","sWOWPBvwNY2","2016Q1","189.0"],["m5WIYYiOtSp","sWOWPBvwNY2","2015Q4","146.0"],["m5WIYYiOtSp","IgTAEKMqKRe","2016Q1","157.0"],["m5WIYYiOtSp","IgTAEKMqKRe","2015Q4","123.0"],["m5WIYYiOtSp","qarQhOt2OEh","2016Q1","222.0"],["m5WIYYiOtSp","qarQhOt2OEh","2015Q4","111.0"],["m5WIYYiOtSp","Crkg9BoUo5w","2016Q1","206.0"],["m5WIYYiOtSp","Crkg9BoUo5w","2015Q4","199.0"],["m5WIYYiOtSp","EO3Ps3ny0Nr","2016Q1","409.0"],["m5WIYYiOtSp","EO3Ps3ny0Nr","2015Q4","316.0"],["Gk33rUTrPL5","m0frOspS7JY","2016Q1","1271040.0"],["Gk33rUTrPL5","m0frOspS7JY","2015Q4","923689.0"],["Gk33rUTrPL5","lnOyHhoLzre","2016Q1","43793.0"],["Gk33rUTrPL5","lnOyHhoLzre","2015Q4","33376.0"],["Gk33rUTrPL5","LGTVRhKSn1V","2016Q1","17409.0"],["Gk33rUTrPL5","LGTVRhKSn1V","2015Q4","13145.0"],["Gk33rUTrPL5","vU0Qt1A5IDz","2016Q1","61720.0"],["Gk33rUTrPL5","vU0Qt1A5IDz","2015Q4","47583.0"],["Gk33rUTrPL5","ZYYX8Q9SGoV","2016Q1","29355.0"],["Gk33rUTrPL5","ZYYX8Q9SGoV","2015Q4","18917.0"],["Gk33rUTrPL5","DWSo42hunXH","2016Q1","18532.0"],["Gk33rUTrPL5","DWSo42hunXH","2015Q4","14141.0"],["Gk33rUTrPL5","bN5q5k5DgLA","2016Q1","41843.0"],["Gk33rUTrPL5","bN5q5k5DgLA","2015Q4","28304.0"],["Gk33rUTrPL5","YtVMnut7Foe","2016Q1","45756.0"],["Gk33rUTrPL5","YtVMnut7Foe","2015Q4","37282.0"],["Gk33rUTrPL5","A3b5mw8DJYC","2016Q1","56266.0"],["Gk33rUTrPL5","A3b5mw8DJYC","2015Q4","43732.0"],["Gk33rUTrPL5","kZ6RlMnt2bp","2016Q1","80456.0"],["Gk33rUTrPL5","kZ6RlMnt2bp","2015Q4","48582.0"],["Gk33rUTrPL5","Rg0jCRi9297","2016Q1","15369.0"],["Gk33rUTrPL5","Rg0jCRi9297","2015Q4","8327.0"],["Gk33rUTrPL5","vAtZ8a924Lx","2016Q1","35208.0"],["Gk33rUTrPL5","vAtZ8a924Lx","2015Q4","29807.0"],["Gk33rUTrPL5","vYT08q7Wo33","2016Q1","31149.0"],["Gk33rUTrPL5","vYT08q7Wo33","2015Q4","27863.0"],["Gk33rUTrPL5","yyW17iCz9As","2016Q1","41907.0"],["Gk33rUTrPL5","yyW17iCz9As","2015Q4","39548.0"],["Gk33rUTrPL5","qg5ySBw9X5l","2016Q1","28630.0"],["Gk33rUTrPL5","qg5ySBw9X5l","2015Q4","26720.0"],["Gk33rUTrPL5","RD96nI1JXVV","2016Q1","28613.0"],["Gk33rUTrPL5","RD96nI1JXVV","2015Q4","18933.0"],["Gk33rUTrPL5","VMgrQWSVIYn","2016Q1","30659.0"],["Gk33rUTrPL5","VMgrQWSVIYn","2015Q4","30297.0"],["Gk33rUTrPL5","acZHYslyJLt","2016Q1","184683.0"],["Gk33rUTrPL5","acZHYslyJLt","2015Q4","133458.0"],["Gk33rUTrPL5","MAL4cfZoFhJ","2016Q1","36162.0"],["Gk33rUTrPL5","MAL4cfZoFhJ","2015Q4","21160.0"],["Gk33rUTrPL5","Cpd5l15XxwA","2016Q1","30870.0"],["Gk33rUTrPL5","Cpd5l15XxwA","2015Q4","16322.0"],["Gk33rUTrPL5","hAFRrgDK0fy","2016Q1","36959.0"],["Gk33rUTrPL5","hAFRrgDK0fy","2015Q4","27529.0"],["Gk33rUTrPL5","Sj50oz9EHvD","2016Q1","36643.0"],["Gk33rUTrPL5","Sj50oz9EHvD","2015Q4","38619.0"],["Gk33rUTrPL5","sWOWPBvwNY2","2016Q1","25844.0"],["Gk33rUTrPL5","sWOWPBvwNY2","2015Q4","23743.0"],["Gk33rUTrPL5","IgTAEKMqKRe","2016Q1","48202.0"],["Gk33rUTrPL5","IgTAEKMqKRe","2015Q4","26434.0"],["Gk33rUTrPL5","qarQhOt2OEh","2016Q1","50791.0"],["Gk33rUTrPL5","qarQhOt2OEh","2015Q4","19542.0"],["Gk33rUTrPL5","Crkg9BoUo5w","2016Q1","124538.0"],["Gk33rUTrPL5","Crkg9BoUo5w","2015Q4","96712.0"],["Gk33rUTrPL5","EO3Ps3ny0Nr","2016Q1","87247.0"],["Gk33rUTrPL5","EO3Ps3ny0Nr","2015Q4","50285.0"],["hk8DwZuW4Ay","m0frOspS7JY","2016Q1","257050.0"],["hk8DwZuW4Ay","m0frOspS7JY","2015Q4","157709.0"],["hk8DwZuW4Ay","lnOyHhoLzre","2016Q1","7670.0"],["hk8DwZuW4Ay","lnOyHhoLzre","2015Q4","5404.0"],["hk8DwZuW4Ay","LGTVRhKSn1V","2016Q1","1055.0"],["hk8DwZuW4Ay","LGTVRhKSn1V","2015Q4","522.0"],["hk8DwZuW4Ay","vU0Qt1A5IDz","2016Q1","19067.0"],["hk8DwZuW4Ay","vU0Qt1A5IDz","2015Q4","6753.0"],["hk8DwZuW4Ay","ZYYX8Q9SGoV","2016Q1","4339.0"],["hk8DwZuW4Ay","ZYYX8Q9SGoV","2015Q4","1819.0"],["hk8DwZuW4Ay","DWSo42hunXH","2016Q1","2075.0"],["hk8DwZuW4Ay","DWSo42hunXH","2015Q4","1518.0"],["hk8DwZuW4Ay","bN5q5k5DgLA","2016Q1","8504.0"],["hk8DwZuW4Ay","bN5q5k5DgLA","2015Q4","4304.0"],["hk8DwZuW4Ay","YtVMnut7Foe","2016Q1","6056.0"],["hk8DwZuW4Ay","YtVMnut7Foe","2015Q4","5701.0"],["hk8DwZuW4Ay","A3b5mw8DJYC","2016Q1","6511.0"],["hk8DwZuW4Ay","A3b5mw8DJYC","2015Q4","3842.0"],["hk8DwZuW4Ay","kZ6RlMnt2bp","2016Q1","15188.0"],["hk8DwZuW4Ay","kZ6RlMnt2bp","2015Q4","7805.0"],["hk8DwZuW4Ay","Rg0jCRi9297","2016Q1","2100.0"],["hk8DwZuW4Ay","Rg0jCRi9297","2015Q4","886.0"],["hk8DwZuW4Ay","vAtZ8a924Lx","2016Q1","8042.0"],["hk8DwZuW4Ay","vAtZ8a924Lx","2015Q4","3948.0"],["hk8DwZuW4Ay","vYT08q7Wo33","2016Q1","3817.0"],["hk8DwZuW4Ay","vYT08q7Wo33","2015Q4","2653.0"],["hk8DwZuW4Ay","yyW17iCz9As","2016Q1","8360.0"],["hk8DwZuW4Ay","yyW17iCz9As","2015Q4","7751.0"],["hk8DwZuW4Ay","qg5ySBw9X5l","2016Q1","2336.0"],["hk8DwZuW4Ay","qg5ySBw9X5l","2015Q4","2347.0"],["hk8DwZuW4Ay","RD96nI1JXVV","2016Q1","5627.0"],["hk8DwZuW4Ay","RD96nI1JXVV","2015Q4","2695.0"],["hk8DwZuW4Ay","VMgrQWSVIYn","2016Q1","6371.0"],["hk8DwZuW4Ay","VMgrQWSVIYn","2015Q4","5808.0"],["hk8DwZuW4Ay","acZHYslyJLt","2016Q1","49628.0"],["hk8DwZuW4Ay","acZHYslyJLt","2015Q4","31671.0"],["hk8DwZuW4Ay","MAL4cfZoFhJ","2016Q1","9223.0"],["hk8DwZuW4Ay","MAL4cfZoFhJ","2015Q4","4302.0"],["hk8DwZuW4Ay","Cpd5l15XxwA","2016Q1","3153.0"],["hk8DwZuW4Ay","Cpd5l15XxwA","2015Q4","1349.0"],["hk8DwZuW4Ay","hAFRrgDK0fy","2016Q1","3291.0"],["hk8DwZuW4Ay","hAFRrgDK0fy","2015Q4","3414.0"],["hk8DwZuW4Ay","Sj50oz9EHvD","2016Q1","4710.0"],["hk8DwZuW4Ay","Sj50oz9EHvD","2015Q4","3483.0"],["hk8DwZuW4Ay","sWOWPBvwNY2","2016Q1","3315.0"],["hk8DwZuW4Ay","sWOWPBvwNY2","2015Q4","1906.0"],["hk8DwZuW4Ay","IgTAEKMqKRe","2016Q1","9052.0"],["hk8DwZuW4Ay","IgTAEKMqKRe","2015Q4","5386.0"],["hk8DwZuW4Ay","qarQhOt2OEh","2016Q1","9030.0"],["hk8DwZuW4Ay","qarQhOt2OEh","2015Q4","3016.0"],["hk8DwZuW4Ay","Crkg9BoUo5w","2016Q1","35449.0"],["hk8DwZuW4Ay","Crkg9BoUo5w","2015Q4","25398.0"],["hk8DwZuW4Ay","EO3Ps3ny0Nr","2016Q1","22786.0"],["hk8DwZuW4Ay","EO3Ps3ny0Nr","2015Q4","13478.0"],["vfaY7k6TINl","m0frOspS7JY","2016Q1","7.9"],["vfaY7k6TINl","m0frOspS7JY","2015Q4","7.0"],["vfaY7k6TINl","lnOyHhoLzre","2016Q1","0.35"],["vfaY7k6TINl","lnOyHhoLzre","2015Q4","0.61"],["vfaY7k6TINl","LGTVRhKSn1V","2016Q1","1.8"],["vfaY7k6TINl","LGTVRhKSn1V","2015Q4","1.1"],["vfaY7k6TINl","vU0Qt1A5IDz","2016Q1","9.5"],["vfaY7k6TINl","vU0Qt1A5IDz","2015Q4","7.1"],["vfaY7k6TINl","ZYYX8Q9SGoV","2016Q1","11.6"],["vfaY7k6TINl","ZYYX8Q9SGoV","2015Q4","12.6"],["vfaY7k6TINl","DWSo42hunXH","2016Q1","10.1"],["vfaY7k6TINl","DWSo42hunXH","2015Q4","6.0"],["vfaY7k6TINl","bN5q5k5DgLA","2016Q1","19.2"],["vfaY7k6TINl","bN5q5k5DgLA","2015Q4","17.9"],["vfaY7k6TINl","YtVMnut7Foe","2016Q1","0.23"],["vfaY7k6TINl","YtVMnut7Foe","2015Q4","0.68"],["vfaY7k6TINl","A3b5mw8DJYC","2016Q1","3.6"],["vfaY7k6TINl","A3b5mw8DJYC","2015Q4","3.1"],["vfaY7k6TINl","kZ6RlMnt2bp","2016Q1","13.0"],["vfaY7k6TINl","kZ6RlMnt2bp","2015Q4","11.4"],["vfaY7k6TINl","Rg0jCRi9297","2016Q1","2.1"],["vfaY7k6TINl","Rg0jCRi9297","2015Q4","2.4"],["vfaY7k6TINl","vAtZ8a924Lx","2016Q1","5.9"],["vfaY7k6TINl","vAtZ8a924Lx","2015Q4","5.1"],["vfaY7k6TINl","vYT08q7Wo33","2016Q1","14.4"],["vfaY7k6TINl","vYT08q7Wo33","2015Q4","15.7"],["vfaY7k6TINl","yyW17iCz9As","2016Q1","6.8"],["vfaY7k6TINl","yyW17iCz9As","2015Q4","7.4"],["vfaY7k6TINl","qg5ySBw9X5l","2016Q1","0.59"],["vfaY7k6TINl","qg5ySBw9X5l","2015Q4","0.39"],["vfaY7k6TINl","RD96nI1JXVV","2016Q1","15.2"],["vfaY7k6TINl","RD96nI1JXVV","2015Q4","13.4"],["vfaY7k6TINl","VMgrQWSVIYn","2016Q1","17.8"],["vfaY7k6TINl","VMgrQWSVIYn","2015Q4","14.0"],["vfaY7k6TINl","acZHYslyJLt","2016Q1","2.4"],["vfaY7k6TINl","acZHYslyJLt","2015Q4","1.8"],["vfaY7k6TINl","MAL4cfZoFhJ","2016Q1","16.4"],["vfaY7k6TINl","MAL4cfZoFhJ","2015Q4","15.9"],["vfaY7k6TINl","Cpd5l15XxwA","2016Q1","2.1"],["vfaY7k6TINl","Cpd5l15XxwA","2015Q4","1.5"],["vfaY7k6TINl","hAFRrgDK0fy","2016Q1","11.4"],["vfaY7k6TINl","hAFRrgDK0fy","2015Q4","12.5"],["vfaY7k6TINl","Sj50oz9EHvD","2016Q1","9.9"],["vfaY7k6TINl","Sj50oz9EHvD","2015Q4","8.1"],["vfaY7k6TINl","sWOWPBvwNY2","2016Q1","1.6"],["vfaY7k6TINl","sWOWPBvwNY2","2015Q4","0.67"],["vfaY7k6TINl","IgTAEKMqKRe","2016Q1","9.2"],["vfaY7k6TINl","IgTAEKMqKRe","2015Q4","6.8"],["vfaY7k6TINl","qarQhOt2OEh","2016Q1","1.7"],["vfaY7k6TINl","qarQhOt2OEh","2015Q4","1.2"],["vfaY7k6TINl","Crkg9BoUo5w","2016Q1","15.0"],["vfaY7k6TINl","Crkg9BoUo5w","2015Q4","14.4"],["vfaY7k6TINl","EO3Ps3ny0Nr","2016Q1","11.1"],["vfaY7k6TINl","EO3Ps3ny0Nr","2015Q4","8.2"],["jjmSfPm3dJk","m0frOspS7JY","2016Q1","0.0"],["jjmSfPm3dJk","m0frOspS7JY","2015Q4","0.0"],["jjmSfPm3dJk","lnOyHhoLzre","2016Q1","0.0"],["jjmSfPm3dJk","lnOyHhoLzre","2015Q4","0.0"],["jjmSfPm3dJk","LGTVRhKSn1V","2016Q1","0.0"],["jjmSfPm3dJk","LGTVRhKSn1V","2015Q4","0.0"],["jjmSfPm3dJk","vU0Qt1A5IDz","2016Q1","0.0"],["jjmSfPm3dJk","vU0Qt1A5IDz","2015Q4","0.0"],["jjmSfPm3dJk","ZYYX8Q9SGoV","2016Q1","0.0"],["jjmSfPm3dJk","ZYYX8Q9SGoV","2015Q4","0.0"],["jjmSfPm3dJk","DWSo42hunXH","2016Q1","0.0"],["jjmSfPm3dJk","DWSo42hunXH","2015Q4","0.0"],["jjmSfPm3dJk","bN5q5k5DgLA","2016Q1","0.0"],["jjmSfPm3dJk","bN5q5k5DgLA","2015Q4","0.0"],["jjmSfPm3dJk","YtVMnut7Foe","2016Q1","0.0"],["jjmSfPm3dJk","YtVMnut7Foe","2015Q4","0.0"],["jjmSfPm3dJk","A3b5mw8DJYC","2016Q1","0.0"],["jjmSfPm3dJk","A3b5mw8DJYC","2015Q4","0.0"],["jjmSfPm3dJk","kZ6RlMnt2bp","2016Q1","0.0"],["jjmSfPm3dJk","kZ6RlMnt2bp","2015Q4","0.0"],["jjmSfPm3dJk","Rg0jCRi9297","2016Q1","0.0"],["jjmSfPm3dJk","Rg0jCRi9297","2015Q4","0.0"],["jjmSfPm3dJk","vAtZ8a924Lx","2016Q1","0.0"],["jjmSfPm3dJk","vAtZ8a924Lx","2015Q4","0.0"],["jjmSfPm3dJk","vYT08q7Wo33","2016Q1","0.0"],["jjmSfPm3dJk","vYT08q7Wo33","2015Q4","0.0"],["jjmSfPm3dJk","yyW17iCz9As","2016Q1","0.0"],["jjmSfPm3dJk","yyW17iCz9As","2015Q4","0.0"],["jjmSfPm3dJk","qg5ySBw9X5l","2016Q1","0.0"],["jjmSfPm3dJk","qg5ySBw9X5l","2015Q4","0.0"],["jjmSfPm3dJk","RD96nI1JXVV","2016Q1","0.0"],["jjmSfPm3dJk","RD96nI1JXVV","2015Q4","0.0"],["jjmSfPm3dJk","VMgrQWSVIYn","2016Q1","0.0"],["jjmSfPm3dJk","VMgrQWSVIYn","2015Q4","0.0"],["jjmSfPm3dJk","acZHYslyJLt","2016Q1","0.0"],["jjmSfPm3dJk","acZHYslyJLt","2015Q4","0.0"],["jjmSfPm3dJk","MAL4cfZoFhJ","2016Q1","0.0"],["jjmSfPm3dJk","MAL4cfZoFhJ","2015Q4","0.0"],["jjmSfPm3dJk","Cpd5l15XxwA","2016Q1","0.0"],["jjmSfPm3dJk","Cpd5l15XxwA","2015Q4","0.0"],["jjmSfPm3dJk","hAFRrgDK0fy","2016Q1","0.0"],["jjmSfPm3dJk","hAFRrgDK0fy","2015Q4","0.0"],["jjmSfPm3dJk","Sj50oz9EHvD","2016Q1","0.0"],["jjmSfPm3dJk","Sj50oz9EHvD","2015Q4","0.0"],["jjmSfPm3dJk","sWOWPBvwNY2","2016Q1","0.0"],["jjmSfPm3dJk","sWOWPBvwNY2","2015Q4","0.0"],["jjmSfPm3dJk","IgTAEKMqKRe","2016Q1","0.0"],["jjmSfPm3dJk","IgTAEKMqKRe","2015Q4","0.0"],["jjmSfPm3dJk","qarQhOt2OEh","2016Q1","0.0"],["jjmSfPm3dJk","qarQhOt2OEh","2015Q4","0.0"],["jjmSfPm3dJk","Crkg9BoUo5w","2016Q1","0.0"],["jjmSfPm3dJk","Crkg9BoUo5w","2015Q4","0.0"],["jjmSfPm3dJk","EO3Ps3ny0Nr","2016Q1","0.0"],["jjmSfPm3dJk","EO3Ps3ny0Nr","2015Q4","0.0"],["TRoamv0YPt3","m0frOspS7JY","2016Q1","14.7"],["TRoamv0YPt3","m0frOspS7JY","2015Q4","13.9"],["TRoamv0YPt3","lnOyHhoLzre","2016Q1","18.5"],["TRoamv0YPt3","lnOyHhoLzre","2015Q4","15.8"],["TRoamv0YPt3","LGTVRhKSn1V","2016Q1","13.3"],["TRoamv0YPt3","LGTVRhKSn1V","2015Q4","13.4"],["TRoamv0YPt3","vU0Qt1A5IDz","2016Q1","8.0"],["TRoamv0YPt3","vU0Qt1A5IDz","2015Q4","7.3"],["TRoamv0YPt3","ZYYX8Q9SGoV","2016Q1","18.5"],["TRoamv0YPt3","ZYYX8Q9SGoV","2015Q4","19.1"],["TRoamv0YPt3","DWSo42hunXH","2016Q1","18.7"],["TRoamv0YPt3","DWSo42hunXH","2015Q4","11.4"],["TRoamv0YPt3","bN5q5k5DgLA","2016Q1","16.6"],["TRoamv0YPt3","bN5q5k5DgLA","2015Q4","15.7"],["TRoamv0YPt3","YtVMnut7Foe","2016Q1","27.4"],["TRoamv0YPt3","YtVMnut7Foe","2015Q4","22.9"],["TRoamv0YPt3","A3b5mw8DJYC","2016Q1","19.5"],["TRoamv0YPt3","A3b5mw8DJYC","2015Q4","16.0"],["TRoamv0YPt3","kZ6RlMnt2bp","2016Q1","15.4"],["TRoamv0YPt3","kZ6RlMnt2bp","2015Q4","12.9"],["TRoamv0YPt3","Rg0jCRi9297","2016Q1","21.2"],["TRoamv0YPt3","Rg0jCRi9297","2015Q4","22.8"],["TRoamv0YPt3","vAtZ8a924Lx","2016Q1","20.3"],["TRoamv0YPt3","vAtZ8a924Lx","2015Q4","18.6"],["TRoamv0YPt3","vYT08q7Wo33","2016Q1","10.4"],["TRoamv0YPt3","vYT08q7Wo33","2015Q4","11.9"],["TRoamv0YPt3","yyW17iCz9As","2016Q1","12.3"],["TRoamv0YPt3","yyW17iCz9As","2015Q4","11.1"],["TRoamv0YPt3","qg5ySBw9X5l","2016Q1","7.8"],["TRoamv0YPt3","qg5ySBw9X5l","2015Q4","9.7"],["TRoamv0YPt3","RD96nI1JXVV","2016Q1","9.8"],["TRoamv0YPt3","RD96nI1JXVV","2015Q4","6.2"],["TRoamv0YPt3","VMgrQWSVIYn","2016Q1","18.4"],["TRoamv0YPt3","VMgrQWSVIYn","2015Q4","17.6"],["TRoamv0YPt3","acZHYslyJLt","2016Q1","9.3"],["TRoamv0YPt3","acZHYslyJLt","2015Q4","13.0"],["TRoamv0YPt3","MAL4cfZoFhJ","2016Q1","12.5"],["TRoamv0YPt3","MAL4cfZoFhJ","2015Q4","13.0"],["TRoamv0YPt3","Cpd5l15XxwA","2016Q1","12.4"],["TRoamv0YPt3","Cpd5l15XxwA","2015Q4","12.6"],["TRoamv0YPt3","hAFRrgDK0fy","2016Q1","8.2"],["TRoamv0YPt3","hAFRrgDK0fy","2015Q4","7.7"],["TRoamv0YPt3","Sj50oz9EHvD","2016Q1","16.5"],["TRoamv0YPt3","Sj50oz9EHvD","2015Q4","17.5"],["TRoamv0YPt3","sWOWPBvwNY2","2016Q1","22.2"],["TRoamv0YPt3","sWOWPBvwNY2","2015Q4","21.2"],["TRoamv0YPt3","IgTAEKMqKRe","2016Q1","17.1"],["TRoamv0YPt3","IgTAEKMqKRe","2015Q4","17.9"],["TRoamv0YPt3","qarQhOt2OEh","2016Q1","26.1"],["TRoamv0YPt3","qarQhOt2OEh","2015Q4","23.9"],["TRoamv0YPt3","Crkg9BoUo5w","2016Q1","22.7"],["TRoamv0YPt3","Crkg9BoUo5w","2015Q4","18.0"],["TRoamv0YPt3","EO3Ps3ny0Nr","2016Q1","12.5"],["TRoamv0YPt3","EO3Ps3ny0Nr","2015Q4","7.4"],["qN1zFaX9mVe","m0frOspS7JY","2016Q1","489591.0"],["qN1zFaX9mVe","m0frOspS7JY","2015Q4","468794.0"],["qN1zFaX9mVe","lnOyHhoLzre","2016Q1","11359.0"],["qN1zFaX9mVe","lnOyHhoLzre","2015Q4","10746.0"],["qN1zFaX9mVe","LGTVRhKSn1V","2016Q1","15928.0"],["qN1zFaX9mVe","LGTVRhKSn1V","2015Q4","16040.0"],["qN1zFaX9mVe","vU0Qt1A5IDz","2016Q1","19708.0"],["qN1zFaX9mVe","vU0Qt1A5IDz","2015Q4","18695.0"],["qN1zFaX9mVe","ZYYX8Q9SGoV","2016Q1","12984.0"],["qN1zFaX9mVe","ZYYX8Q9SGoV","2015Q4","13363.0"],["qN1zFaX9mVe","DWSo42hunXH","2016Q1","9669.0"],["qN1zFaX9mVe","DWSo42hunXH","2015Q4","9250.0"],["qN1zFaX9mVe","bN5q5k5DgLA","2016Q1","10572.0"],["qN1zFaX9mVe","bN5q5k5DgLA","2015Q4","10094.0"],["qN1zFaX9mVe","YtVMnut7Foe","2016Q1","20227.0"],["qN1zFaX9mVe","YtVMnut7Foe","2015Q4","18874.0"],["qN1zFaX9mVe","A3b5mw8DJYC","2016Q1","19975.0"],["qN1zFaX9mVe","A3b5mw8DJYC","2015Q4","17340.0"],["qN1zFaX9mVe","kZ6RlMnt2bp","2016Q1","31475.0"],["qN1zFaX9mVe","kZ6RlMnt2bp","2015Q4","34128.0"],["qN1zFaX9mVe","Rg0jCRi9297","2016Q1","11172.0"],["qN1zFaX9mVe","Rg0jCRi9297","2015Q4","10720.0"],["qN1zFaX9mVe","vAtZ8a924Lx","2016Q1","16271.0"],["qN1zFaX9mVe","vAtZ8a924Lx","2015Q4","14855.0"],["qN1zFaX9mVe","vYT08q7Wo33","2016Q1","23315.0"],["qN1zFaX9mVe","vYT08q7Wo33","2015Q4","20177.0"],["qN1zFaX9mVe","yyW17iCz9As","2016Q1","11616.0"],["qN1zFaX9mVe","yyW17iCz9As","2015Q4","11117.0"],["qN1zFaX9mVe","qg5ySBw9X5l","2016Q1","15097.0"],["qN1zFaX9mVe","qg5ySBw9X5l","2015Q4","15602.0"],["qN1zFaX9mVe","RD96nI1JXVV","2016Q1","20861.0"],["qN1zFaX9mVe","RD96nI1JXVV","2015Q4","17837.0"],["qN1zFaX9mVe","VMgrQWSVIYn","2016Q1","7644.0"],["qN1zFaX9mVe","VMgrQWSVIYn","2015Q4","7008.0"],["qN1zFaX9mVe","acZHYslyJLt","2016Q1","42211.0"],["qN1zFaX9mVe","acZHYslyJLt","2015Q4","41291.0"],["qN1zFaX9mVe","MAL4cfZoFhJ","2016Q1","26515.0"],["qN1zFaX9mVe","MAL4cfZoFhJ","2015Q4","23757.0"],["qN1zFaX9mVe","Cpd5l15XxwA","2016Q1","19853.0"],["qN1zFaX9mVe","Cpd5l15XxwA","2015Q4","22129.0"],["qN1zFaX9mVe","hAFRrgDK0fy","2016Q1","34153.0"],["qN1zFaX9mVe","hAFRrgDK0fy","2015Q4","32014.0"],["qN1zFaX9mVe","Sj50oz9EHvD","2016Q1","22609.0"],["qN1zFaX9mVe","Sj50oz9EHvD","2015Q4","23010.0"],["qN1zFaX9mVe","sWOWPBvwNY2","2016Q1","8903.0"],["qN1zFaX9mVe","sWOWPBvwNY2","2015Q4","8940.0"],["qN1zFaX9mVe","IgTAEKMqKRe","2016Q1","23175.0"],["qN1zFaX9mVe","IgTAEKMqKRe","2015Q4","20888.0"],["qN1zFaX9mVe","qarQhOt2OEh","2016Q1","6194.0"],["qN1zFaX9mVe","qarQhOt2OEh","2015Q4","6448.0"],["qN1zFaX9mVe","Crkg9BoUo5w","2016Q1","27963.0"],["qN1zFaX9mVe","Crkg9BoUo5w","2015Q4","24212.0"],["qN1zFaX9mVe","EO3Ps3ny0Nr","2016Q1","20142.0"],["qN1zFaX9mVe","EO3Ps3ny0Nr","2015Q4","20259.0"],["FumHFC1J66L","m0frOspS7JY","2016Q1","16.2"],["FumHFC1J66L","m0frOspS7JY","2015Q4","16.4"],["FumHFC1J66L","lnOyHhoLzre","2016Q1","10.0"],["FumHFC1J66L","lnOyHhoLzre","2015Q4","10.5"],["FumHFC1J66L","LGTVRhKSn1V","2016Q1","10.4"],["FumHFC1J66L","LGTVRhKSn1V","2015Q4","13.8"],["FumHFC1J66L","vU0Qt1A5IDz","2016Q1","17.3"],["FumHFC1J66L","vU0Qt1A5IDz","2015Q4","16.0"],["FumHFC1J66L","ZYYX8Q9SGoV","2016Q1","7.5"],["FumHFC1J66L","ZYYX8Q9SGoV","2015Q4","8.4"],["FumHFC1J66L","DWSo42hunXH","2016Q1","18.5"],["FumHFC1J66L","DWSo42hunXH","2015Q4","30.1"],["FumHFC1J66L","bN5q5k5DgLA","2016Q1","22.7"],["FumHFC1J66L","bN5q5k5DgLA","2015Q4","20.7"],["FumHFC1J66L","YtVMnut7Foe","2016Q1","17.4"],["FumHFC1J66L","YtVMnut7Foe","2015Q4","17.9"],["FumHFC1J66L","A3b5mw8DJYC","2016Q1","14.8"],["FumHFC1J66L","A3b5mw8DJYC","2015Q4","15.6"],["FumHFC1J66L","kZ6RlMnt2bp","2016Q1","13.5"],["FumHFC1J66L","kZ6RlMnt2bp","2015Q4","14.4"],["FumHFC1J66L","Rg0jCRi9297","2016Q1","14.9"],["FumHFC1J66L","Rg0jCRi9297","2015Q4","13.7"],["FumHFC1J66L","vAtZ8a924Lx","2016Q1","16.5"],["FumHFC1J66L","vAtZ8a924Lx","2015Q4","16.4"],["FumHFC1J66L","vYT08q7Wo33","2016Q1","15.4"],["FumHFC1J66L","vYT08q7Wo33","2015Q4","17.8"],["FumHFC1J66L","yyW17iCz9As","2016Q1","11.9"],["FumHFC1J66L","yyW17iCz9As","2015Q4","14.6"],["FumHFC1J66L","qg5ySBw9X5l","2016Q1","19.4"],["FumHFC1J66L","qg5ySBw9X5l","2015Q4","21.9"],["FumHFC1J66L","RD96nI1JXVV","2016Q1","14.9"],["FumHFC1J66L","RD96nI1JXVV","2015Q4","14.7"],["FumHFC1J66L","VMgrQWSVIYn","2016Q1","25.3"],["FumHFC1J66L","VMgrQWSVIYn","2015Q4","22.9"],["FumHFC1J66L","acZHYslyJLt","2016Q1","23.1"],["FumHFC1J66L","acZHYslyJLt","2015Q4","20.5"],["FumHFC1J66L","MAL4cfZoFhJ","2016Q1","19.5"],["FumHFC1J66L","MAL4cfZoFhJ","2015Q4","24.4"],["FumHFC1J66L","Cpd5l15XxwA","2016Q1","7.7"],["FumHFC1J66L","Cpd5l15XxwA","2015Q4","8.9"],["FumHFC1J66L","hAFRrgDK0fy","2016Q1","20.6"],["FumHFC1J66L","hAFRrgDK0fy","2015Q4","18.9"],["FumHFC1J66L","Sj50oz9EHvD","2016Q1","16.7"],["FumHFC1J66L","Sj50oz9EHvD","2015Q4","15.1"],["FumHFC1J66L","sWOWPBvwNY2","2016Q1","16.5"],["FumHFC1J66L","sWOWPBvwNY2","2015Q4","17.4"],["FumHFC1J66L","IgTAEKMqKRe","2016Q1","19.7"],["FumHFC1J66L","IgTAEKMqKRe","2015Q4","13.5"],["FumHFC1J66L","qarQhOt2OEh","2016Q1","14.8"],["FumHFC1J66L","qarQhOt2OEh","2015Q4","13.7"],["FumHFC1J66L","Crkg9BoUo5w","2016Q1","12.2"],["FumHFC1J66L","Crkg9BoUo5w","2015Q4","15.4"],["FumHFC1J66L","EO3Ps3ny0Nr","2016Q1","18.6"],["FumHFC1J66L","EO3Ps3ny0Nr","2015Q4","17.9"],["bzTuXoKa87E","m0frOspS7JY","2016Q1","4.5"],["bzTuXoKa87E","m0frOspS7JY","2015Q4","1.8"],["bzTuXoKa87E","lnOyHhoLzre","2016Q1","0.0"],["bzTuXoKa87E","lnOyHhoLzre","2015Q4","0.0"],["bzTuXoKa87E","LGTVRhKSn1V","2016Q1","0.0"],["bzTuXoKa87E","LGTVRhKSn1V","2015Q4","0.0"],["bzTuXoKa87E","vU0Qt1A5IDz","2016Q1","0.0"],["bzTuXoKa87E","vU0Qt1A5IDz","2015Q4","0.0"],["bzTuXoKa87E","ZYYX8Q9SGoV","2016Q1","0.0"],["bzTuXoKa87E","ZYYX8Q9SGoV","2015Q4","15.6"],["bzTuXoKa87E","DWSo42hunXH","2016Q1","0.0"],["bzTuXoKa87E","DWSo42hunXH","2015Q4","18.2"],["bzTuXoKa87E","bN5q5k5DgLA","2016Q1","0.0"],["bzTuXoKa87E","bN5q5k5DgLA","2015Q4","0.0"],["bzTuXoKa87E","YtVMnut7Foe","2016Q1","0.0"],["bzTuXoKa87E","YtVMnut7Foe","2015Q4","0.0"],["bzTuXoKa87E","A3b5mw8DJYC","2016Q1","0.0"],["bzTuXoKa87E","A3b5mw8DJYC","2015Q4","0.0"],["bzTuXoKa87E","kZ6RlMnt2bp","2016Q1","0.0"],["bzTuXoKa87E","kZ6RlMnt2bp","2015Q4","0.0"],["bzTuXoKa87E","Rg0jCRi9297","2016Q1","0.0"],["bzTuXoKa87E","Rg0jCRi9297","2015Q4","0.0"],["bzTuXoKa87E","vAtZ8a924Lx","2016Q1","0.0"],["bzTuXoKa87E","vAtZ8a924Lx","2015Q4","0.0"],["bzTuXoKa87E","vYT08q7Wo33","2016Q1","0.0"],["bzTuXoKa87E","vYT08q7Wo33","2015Q4","0.0"],["bzTuXoKa87E","yyW17iCz9As","2016Q1","0.0"],["bzTuXoKa87E","yyW17iCz9As","2015Q4","0.0"],["bzTuXoKa87E","qg5ySBw9X5l","2016Q1","0.0"],["bzTuXoKa87E","qg5ySBw9X5l","2015Q4","0.0"],["bzTuXoKa87E","RD96nI1JXVV","2016Q1","0.0"],["bzTuXoKa87E","RD96nI1JXVV","2015Q4","0.0"],["bzTuXoKa87E","VMgrQWSVIYn","2016Q1","0.0"],["bzTuXoKa87E","VMgrQWSVIYn","2015Q4","0.0"],["bzTuXoKa87E","acZHYslyJLt","2016Q1","0.0"],["bzTuXoKa87E","acZHYslyJLt","2015Q4","0.0"],["bzTuXoKa87E","MAL4cfZoFhJ","2016Q1","0.0"],["bzTuXoKa87E","MAL4cfZoFhJ","2015Q4","0.0"],["bzTuXoKa87E","Cpd5l15XxwA","2016Q1","12.0"],["bzTuXoKa87E","Cpd5l15XxwA","2015Q4","0.0"],["bzTuXoKa87E","hAFRrgDK0fy","2016Q1","16.5"],["bzTuXoKa87E","hAFRrgDK0fy","2015Q4","0.0"],["bzTuXoKa87E","Sj50oz9EHvD","2016Q1","6.0"],["bzTuXoKa87E","Sj50oz9EHvD","2015Q4","17.3"],["bzTuXoKa87E","sWOWPBvwNY2","2016Q1","93.7"],["bzTuXoKa87E","sWOWPBvwNY2","2015Q4","0.0"],["bzTuXoKa87E","IgTAEKMqKRe","2016Q1","0.0"],["bzTuXoKa87E","IgTAEKMqKRe","2015Q4","0.0"],["bzTuXoKa87E","qarQhOt2OEh","2016Q1","0.0"],["bzTuXoKa87E","qarQhOt2OEh","2015Q4","0.0"],["bzTuXoKa87E","Crkg9BoUo5w","2016Q1","0.0"],["bzTuXoKa87E","Crkg9BoUo5w","2015Q4","0.0"],["bzTuXoKa87E","EO3Ps3ny0Nr","2016Q1","0.0"],["bzTuXoKa87E","EO3Ps3ny0Nr","2015Q4","0.0"],["HkhBsvPXUqi","m0frOspS7JY","2016Q1","0.0"],["HkhBsvPXUqi","m0frOspS7JY","2015Q4","0.0"],["HkhBsvPXUqi","lnOyHhoLzre","2016Q1","0.0"],["HkhBsvPXUqi","lnOyHhoLzre","2015Q4","0.0"],["HkhBsvPXUqi","LGTVRhKSn1V","2016Q1","0.0"],["HkhBsvPXUqi","LGTVRhKSn1V","2015Q4","0.0"],["HkhBsvPXUqi","vU0Qt1A5IDz","2016Q1","0.0"],["HkhBsvPXUqi","vU0Qt1A5IDz","2015Q4","0.0"],["HkhBsvPXUqi","ZYYX8Q9SGoV","2016Q1","0.0"],["HkhBsvPXUqi","ZYYX8Q9SGoV","2015Q4","0.0"],["HkhBsvPXUqi","DWSo42hunXH","2016Q1","0.0"],["HkhBsvPXUqi","DWSo42hunXH","2015Q4","0.0"],["HkhBsvPXUqi","bN5q5k5DgLA","2016Q1","0.0"],["HkhBsvPXUqi","bN5q5k5DgLA","2015Q4","0.0"],["HkhBsvPXUqi","YtVMnut7Foe","2016Q1","0.0"],["HkhBsvPXUqi","YtVMnut7Foe","2015Q4","0.0"],["HkhBsvPXUqi","A3b5mw8DJYC","2016Q1","0.0"],["HkhBsvPXUqi","A3b5mw8DJYC","2015Q4","0.0"],["HkhBsvPXUqi","kZ6RlMnt2bp","2016Q1","0.0"],["HkhBsvPXUqi","kZ6RlMnt2bp","2015Q4","0.0"],["HkhBsvPXUqi","Rg0jCRi9297","2016Q1","0.0"],["HkhBsvPXUqi","Rg0jCRi9297","2015Q4","0.0"],["HkhBsvPXUqi","vAtZ8a924Lx","2016Q1","0.0"],["HkhBsvPXUqi","vAtZ8a924Lx","2015Q4","0.0"],["HkhBsvPXUqi","vYT08q7Wo33","2016Q1","0.0"],["HkhBsvPXUqi","vYT08q7Wo33","2015Q4","0.0"],["HkhBsvPXUqi","yyW17iCz9As","2016Q1","0.0"],["HkhBsvPXUqi","yyW17iCz9As","2015Q4","0.0"],["HkhBsvPXUqi","qg5ySBw9X5l","2016Q1","0.0"],["HkhBsvPXUqi","qg5ySBw9X5l","2015Q4","0.0"],["HkhBsvPXUqi","RD96nI1JXVV","2016Q1","0.0"],["HkhBsvPXUqi","RD96nI1JXVV","2015Q4","0.0"],["HkhBsvPXUqi","VMgrQWSVIYn","2016Q1","0.0"],["HkhBsvPXUqi","VMgrQWSVIYn","2015Q4","0.0"],["HkhBsvPXUqi","acZHYslyJLt","2016Q1","0.0"],["HkhBsvPXUqi","acZHYslyJLt","2015Q4","0.0"],["HkhBsvPXUqi","MAL4cfZoFhJ","2016Q1","0.0"],["HkhBsvPXUqi","MAL4cfZoFhJ","2015Q4","0.0"],["HkhBsvPXUqi","Cpd5l15XxwA","2016Q1","0.0"],["HkhBsvPXUqi","Cpd5l15XxwA","2015Q4","0.0"],["HkhBsvPXUqi","hAFRrgDK0fy","2016Q1","0.0"],["HkhBsvPXUqi","hAFRrgDK0fy","2015Q4","0.0"],["HkhBsvPXUqi","Sj50oz9EHvD","2016Q1","0.0"],["HkhBsvPXUqi","Sj50oz9EHvD","2015Q4","0.0"],["HkhBsvPXUqi","sWOWPBvwNY2","2016Q1","0.0"],["HkhBsvPXUqi","sWOWPBvwNY2","2015Q4","0.0"],["HkhBsvPXUqi","IgTAEKMqKRe","2016Q1","0.0"],["HkhBsvPXUqi","IgTAEKMqKRe","2015Q4","0.0"],["HkhBsvPXUqi","qarQhOt2OEh","2016Q1","0.0"],["HkhBsvPXUqi","qarQhOt2OEh","2015Q4","0.0"],["HkhBsvPXUqi","Crkg9BoUo5w","2016Q1","0.0"],["HkhBsvPXUqi","Crkg9BoUo5w","2015Q4","0.0"],["HkhBsvPXUqi","EO3Ps3ny0Nr","2016Q1","0.0"],["HkhBsvPXUqi","EO3Ps3ny0Nr","2015Q4","0.0"],["Xaj6TFnz6sT","m0frOspS7JY","2016Q1","163.0"],["Xaj6TFnz6sT","m0frOspS7JY","2015Q4","163.0"],["Xaj6TFnz6sT","lnOyHhoLzre","2016Q1","1.0"],["Xaj6TFnz6sT","lnOyHhoLzre","2015Q4","1.0"],["Xaj6TFnz6sT","LGTVRhKSn1V","2016Q1","4.0"],["Xaj6TFnz6sT","LGTVRhKSn1V","2015Q4","4.0"],["Xaj6TFnz6sT","vU0Qt1A5IDz","2016Q1","6.0"],["Xaj6TFnz6sT","vU0Qt1A5IDz","2015Q4","6.0"],["Xaj6TFnz6sT","ZYYX8Q9SGoV","2016Q1","3.0"],["Xaj6TFnz6sT","ZYYX8Q9SGoV","2015Q4","3.0"],["Xaj6TFnz6sT","DWSo42hunXH","2016Q1","0.0"],["Xaj6TFnz6sT","DWSo42hunXH","2015Q4","0.0"],["Xaj6TFnz6sT","bN5q5k5DgLA","2016Q1","0.0"],["Xaj6TFnz6sT","bN5q5k5DgLA","2015Q4","0.0"],["Xaj6TFnz6sT","YtVMnut7Foe","2016Q1","5.0"],["Xaj6TFnz6sT","YtVMnut7Foe","2015Q4","5.0"],["Xaj6TFnz6sT","A3b5mw8DJYC","2016Q1","20.0"],["Xaj6TFnz6sT","A3b5mw8DJYC","2015Q4","20.0"],["Xaj6TFnz6sT","kZ6RlMnt2bp","2016Q1","3.0"],["Xaj6TFnz6sT","kZ6RlMnt2bp","2015Q4","3.0"],["Xaj6TFnz6sT","Rg0jCRi9297","2016Q1","0.0"],["Xaj6TFnz6sT","Rg0jCRi9297","2015Q4","0.0"],["Xaj6TFnz6sT","vAtZ8a924Lx","2016Q1","0.0"],["Xaj6TFnz6sT","vAtZ8a924Lx","2015Q4","0.0"],["Xaj6TFnz6sT","vYT08q7Wo33","2016Q1","5.0"],["Xaj6TFnz6sT","vYT08q7Wo33","2015Q4","5.0"],["Xaj6TFnz6sT","yyW17iCz9As","2016Q1","3.0"],["Xaj6TFnz6sT","yyW17iCz9As","2015Q4","3.0"],["Xaj6TFnz6sT","qg5ySBw9X5l","2016Q1","2.0"],["Xaj6TFnz6sT","qg5ySBw9X5l","2015Q4","2.0"],["Xaj6TFnz6sT","RD96nI1JXVV","2016Q1","0.0"],["Xaj6TFnz6sT","RD96nI1JXVV","2015Q4","0.0"],["Xaj6TFnz6sT","VMgrQWSVIYn","2016Q1","0.0"],["Xaj6TFnz6sT","VMgrQWSVIYn","2015Q4","0.0"],["Xaj6TFnz6sT","acZHYslyJLt","2016Q1","91.0"],["Xaj6TFnz6sT","acZHYslyJLt","2015Q4","91.0"],["Xaj6TFnz6sT","MAL4cfZoFhJ","2016Q1","2.0"],["Xaj6TFnz6sT","MAL4cfZoFhJ","2015Q4","2.0"],["Xaj6TFnz6sT","Cpd5l15XxwA","2016Q1","1.0"],["Xaj6TFnz6sT","Cpd5l15XxwA","2015Q4","1.0"],["Xaj6TFnz6sT","hAFRrgDK0fy","2016Q1","7.0"],["Xaj6TFnz6sT","hAFRrgDK0fy","2015Q4","7.0"],["Xaj6TFnz6sT","Sj50oz9EHvD","2016Q1","2.0"],["Xaj6TFnz6sT","Sj50oz9EHvD","2015Q4","2.0"],["Xaj6TFnz6sT","sWOWPBvwNY2","2016Q1","3.0"],["Xaj6TFnz6sT","sWOWPBvwNY2","2015Q4","3.0"],["Xaj6TFnz6sT","IgTAEKMqKRe","2016Q1","0.0"],["Xaj6TFnz6sT","IgTAEKMqKRe","2015Q4","0.0"],["Xaj6TFnz6sT","qarQhOt2OEh","2016Q1","0.0"],["Xaj6TFnz6sT","qarQhOt2OEh","2015Q4","0.0"],["Xaj6TFnz6sT","Crkg9BoUo5w","2016Q1","3.0"],["Xaj6TFnz6sT","Crkg9BoUo5w","2015Q4","3.0"],["Xaj6TFnz6sT","EO3Ps3ny0Nr","2016Q1","2.0"],["Xaj6TFnz6sT","EO3Ps3ny0Nr","2015Q4","2.0"],["YDGD2VlXkJG","m0frOspS7JY","2016Q1","260.0"],["YDGD2VlXkJG","m0frOspS7JY","2015Q4","260.0"],["YDGD2VlXkJG","lnOyHhoLzre","2016Q1","17.0"],["YDGD2VlXkJG","lnOyHhoLzre","2015Q4","17.0"],["YDGD2VlXkJG","LGTVRhKSn1V","2016Q1","9.0"],["YDGD2VlXkJG","LGTVRhKSn1V","2015Q4","9.0"],["YDGD2VlXkJG","vU0Qt1A5IDz","2016Q1","11.0"],["YDGD2VlXkJG","vU0Qt1A5IDz","2015Q4","11.0"],["YDGD2VlXkJG","ZYYX8Q9SGoV","2016Q1","11.0"],["YDGD2VlXkJG","ZYYX8Q9SGoV","2015Q4","11.0"],["YDGD2VlXkJG","DWSo42hunXH","2016Q1","1.0"],["YDGD2VlXkJG","DWSo42hunXH","2015Q4","1.0"],["YDGD2VlXkJG","bN5q5k5DgLA","2016Q1","5.0"],["YDGD2VlXkJG","bN5q5k5DgLA","2015Q4","5.0"],["YDGD2VlXkJG","YtVMnut7Foe","2016Q1","13.0"],["YDGD2VlXkJG","YtVMnut7Foe","2015Q4","13.0"],["YDGD2VlXkJG","A3b5mw8DJYC","2016Q1","15.0"],["YDGD2VlXkJG","A3b5mw8DJYC","2015Q4","15.0"],["YDGD2VlXkJG","kZ6RlMnt2bp","2016Q1","7.0"],["YDGD2VlXkJG","kZ6RlMnt2bp","2015Q4","7.0"],["YDGD2VlXkJG","Rg0jCRi9297","2016Q1","5.0"],["YDGD2VlXkJG","Rg0jCRi9297","2015Q4","5.0"],["YDGD2VlXkJG","vAtZ8a924Lx","2016Q1","3.0"],["YDGD2VlXkJG","vAtZ8a924Lx","2015Q4","3.0"],["YDGD2VlXkJG","vYT08q7Wo33","2016Q1","10.0"],["YDGD2VlXkJG","vYT08q7Wo33","2015Q4","10.0"],["YDGD2VlXkJG","yyW17iCz9As","2016Q1","7.0"],["YDGD2VlXkJG","yyW17iCz9As","2015Q4","7.0"],["YDGD2VlXkJG","qg5ySBw9X5l","2016Q1","8.0"],["YDGD2VlXkJG","qg5ySBw9X5l","2015Q4","8.0"],["YDGD2VlXkJG","RD96nI1JXVV","2016Q1","6.0"],["YDGD2VlXkJG","RD96nI1JXVV","2015Q4","6.0"],["YDGD2VlXkJG","VMgrQWSVIYn","2016Q1","9.0"],["YDGD2VlXkJG","VMgrQWSVIYn","2015Q4","9.0"],["YDGD2VlXkJG","acZHYslyJLt","2016Q1","43.0"],["YDGD2VlXkJG","acZHYslyJLt","2015Q4","43.0"],["YDGD2VlXkJG","MAL4cfZoFhJ","2016Q1","4.0"],["YDGD2VlXkJG","MAL4cfZoFhJ","2015Q4","4.0"],["YDGD2VlXkJG","Cpd5l15XxwA","2016Q1","8.0"],["YDGD2VlXkJG","Cpd5l15XxwA","2015Q4","8.0"],["YDGD2VlXkJG","hAFRrgDK0fy","2016Q1","16.0"],["YDGD2VlXkJG","hAFRrgDK0fy","2015Q4","16.0"],["YDGD2VlXkJG","Sj50oz9EHvD","2016Q1","13.0"],["YDGD2VlXkJG","Sj50oz9EHvD","2015Q4","13.0"],["YDGD2VlXkJG","sWOWPBvwNY2","2016Q1","7.0"],["YDGD2VlXkJG","sWOWPBvwNY2","2015Q4","7.0"],["YDGD2VlXkJG","IgTAEKMqKRe","2016Q1","3.0"],["YDGD2VlXkJG","IgTAEKMqKRe","2015Q4","3.0"],["YDGD2VlXkJG","qarQhOt2OEh","2016Q1","11.0"],["YDGD2VlXkJG","qarQhOt2OEh","2015Q4","11.0"],["YDGD2VlXkJG","Crkg9BoUo5w","2016Q1","14.0"],["YDGD2VlXkJG","Crkg9BoUo5w","2015Q4","14.0"],["YDGD2VlXkJG","EO3Ps3ny0Nr","2016Q1","4.0"],["YDGD2VlXkJG","EO3Ps3ny0Nr","2015Q4","4.0"],["yGWlpZdYuKv","m0frOspS7JY","2016Q1","6319.0"],["yGWlpZdYuKv","m0frOspS7JY","2015Q4","6319.0"],["yGWlpZdYuKv","lnOyHhoLzre","2016Q1","341.0"],["yGWlpZdYuKv","lnOyHhoLzre","2015Q4","341.0"],["yGWlpZdYuKv","LGTVRhKSn1V","2016Q1","197.0"],["yGWlpZdYuKv","LGTVRhKSn1V","2015Q4","197.0"],["yGWlpZdYuKv","vU0Qt1A5IDz","2016Q1","328.0"],["yGWlpZdYuKv","vU0Qt1A5IDz","2015Q4","328.0"],["yGWlpZdYuKv","ZYYX8Q9SGoV","2016Q1","263.0"],["yGWlpZdYuKv","ZYYX8Q9SGoV","2015Q4","263.0"],["yGWlpZdYuKv","DWSo42hunXH","2016Q1","60.0"],["yGWlpZdYuKv","DWSo42hunXH","2015Q4","60.0"],["yGWlpZdYuKv","bN5q5k5DgLA","2016Q1","195.0"],["yGWlpZdYuKv","bN5q5k5DgLA","2015Q4","195.0"],["yGWlpZdYuKv","YtVMnut7Foe","2016Q1","301.0"],["yGWlpZdYuKv","YtVMnut7Foe","2015Q4","301.0"],["yGWlpZdYuKv","A3b5mw8DJYC","2016Q1","261.0"],["yGWlpZdYuKv","A3b5mw8DJYC","2015Q4","261.0"],["yGWlpZdYuKv","kZ6RlMnt2bp","2016Q1","288.0"],["yGWlpZdYuKv","kZ6RlMnt2bp","2015Q4","288.0"],["yGWlpZdYuKv","Rg0jCRi9297","2016Q1","147.0"],["yGWlpZdYuKv","Rg0jCRi9297","2015Q4","147.0"],["yGWlpZdYuKv","vAtZ8a924Lx","2016Q1","187.0"],["yGWlpZdYuKv","vAtZ8a924Lx","2015Q4","187.0"],["yGWlpZdYuKv","vYT08q7Wo33","2016Q1","225.0"],["yGWlpZdYuKv","vYT08q7Wo33","2015Q4","225.0"],["yGWlpZdYuKv","yyW17iCz9As","2016Q1","274.0"],["yGWlpZdYuKv","yyW17iCz9As","2015Q4","274.0"],["yGWlpZdYuKv","qg5ySBw9X5l","2016Q1","165.0"],["yGWlpZdYuKv","qg5ySBw9X5l","2015Q4","165.0"],["yGWlpZdYuKv","RD96nI1JXVV","2016Q1","230.0"],["yGWlpZdYuKv","RD96nI1JXVV","2015Q4","230.0"],["yGWlpZdYuKv","VMgrQWSVIYn","2016Q1","208.0"],["yGWlpZdYuKv","VMgrQWSVIYn","2015Q4","208.0"],["yGWlpZdYuKv","acZHYslyJLt","2016Q1","465.0"],["yGWlpZdYuKv","acZHYslyJLt","2015Q4","465.0"],["yGWlpZdYuKv","MAL4cfZoFhJ","2016Q1","130.0"],["yGWlpZdYuKv","MAL4cfZoFhJ","2015Q4","130.0"],["yGWlpZdYuKv","Cpd5l15XxwA","2016Q1","337.0"],["yGWlpZdYuKv","Cpd5l15XxwA","2015Q4","337.0"],["yGWlpZdYuKv","hAFRrgDK0fy","2016Q1","309.0"],["yGWlpZdYuKv","hAFRrgDK0fy","2015Q4","309.0"],["yGWlpZdYuKv","Sj50oz9EHvD","2016Q1","327.0"],["yGWlpZdYuKv","Sj50oz9EHvD","2015Q4","327.0"],["yGWlpZdYuKv","sWOWPBvwNY2","2016Q1","222.0"],["yGWlpZdYuKv","sWOWPBvwNY2","2015Q4","222.0"],["yGWlpZdYuKv","IgTAEKMqKRe","2016Q1","186.0"],["yGWlpZdYuKv","IgTAEKMqKRe","2015Q4","186.0"],["yGWlpZdYuKv","qarQhOt2OEh","2016Q1","220.0"],["yGWlpZdYuKv","qarQhOt2OEh","2015Q4","220.0"],["yGWlpZdYuKv","Crkg9BoUo5w","2016Q1","263.0"],["yGWlpZdYuKv","Crkg9BoUo5w","2015Q4","263.0"],["yGWlpZdYuKv","EO3Ps3ny0Nr","2016Q1","190.0"],["yGWlpZdYuKv","EO3Ps3ny0Nr","2015Q4","190.0"],["LYL0E9cqKLn","m0frOspS7JY","2016Q1","743.0"],["LYL0E9cqKLn","m0frOspS7JY","2015Q4","743.0"],["LYL0E9cqKLn","lnOyHhoLzre","2016Q1","46.0"],["LYL0E9cqKLn","lnOyHhoLzre","2015Q4","46.0"],["LYL0E9cqKLn","LGTVRhKSn1V","2016Q1","18.0"],["LYL0E9cqKLn","LGTVRhKSn1V","2015Q4","18.0"],["LYL0E9cqKLn","vU0Qt1A5IDz","2016Q1","40.0"],["LYL0E9cqKLn","vU0Qt1A5IDz","2015Q4","40.0"],["LYL0E9cqKLn","ZYYX8Q9SGoV","2016Q1","29.0"],["LYL0E9cqKLn","ZYYX8Q9SGoV","2015Q4","29.0"],["LYL0E9cqKLn","DWSo42hunXH","2016Q1","13.0"],["LYL0E9cqKLn","DWSo42hunXH","2015Q4","13.0"],["LYL0E9cqKLn","bN5q5k5DgLA","2016Q1","21.0"],["LYL0E9cqKLn","bN5q5k5DgLA","2015Q4","21.0"],["LYL0E9cqKLn","YtVMnut7Foe","2016Q1","46.0"],["LYL0E9cqKLn","YtVMnut7Foe","2015Q4","46.0"],["LYL0E9cqKLn","A3b5mw8DJYC","2016Q1","23.0"],["LYL0E9cqKLn","A3b5mw8DJYC","2015Q4","23.0"],["LYL0E9cqKLn","kZ6RlMnt2bp","2016Q1","24.0"],["LYL0E9cqKLn","kZ6RlMnt2bp","2015Q4","24.0"],["LYL0E9cqKLn","Rg0jCRi9297","2016Q1","15.0"],["LYL0E9cqKLn","Rg0jCRi9297","2015Q4","15.0"],["LYL0E9cqKLn","vAtZ8a924Lx","2016Q1","21.0"],["LYL0E9cqKLn","vAtZ8a924Lx","2015Q4","21.0"],["LYL0E9cqKLn","vYT08q7Wo33","2016Q1","39.0"],["LYL0E9cqKLn","vYT08q7Wo33","2015Q4","39.0"],["LYL0E9cqKLn","yyW17iCz9As","2016Q1","25.0"],["LYL0E9cqKLn","yyW17iCz9As","2015Q4","25.0"],["LYL0E9cqKLn","qg5ySBw9X5l","2016Q1","21.0"],["LYL0E9cqKLn","qg5ySBw9X5l","2015Q4","21.0"],["LYL0E9cqKLn","RD96nI1JXVV","2016Q1","29.0"],["LYL0E9cqKLn","RD96nI1JXVV","2015Q4","29.0"],["LYL0E9cqKLn","VMgrQWSVIYn","2016Q1","17.0"],["LYL0E9cqKLn","VMgrQWSVIYn","2015Q4","17.0"],["LYL0E9cqKLn","acZHYslyJLt","2016Q1","51.0"],["LYL0E9cqKLn","acZHYslyJLt","2015Q4","51.0"],["LYL0E9cqKLn","MAL4cfZoFhJ","2016Q1","23.0"],["LYL0E9cqKLn","MAL4cfZoFhJ","2015Q4","23.0"],["LYL0E9cqKLn","Cpd5l15XxwA","2016Q1","37.0"],["LYL0E9cqKLn","Cpd5l15XxwA","2015Q4","37.0"],["LYL0E9cqKLn","hAFRrgDK0fy","2016Q1","45.0"],["LYL0E9cqKLn","hAFRrgDK0fy","2015Q4","45.0"],["LYL0E9cqKLn","Sj50oz9EHvD","2016Q1","44.0"],["LYL0E9cqKLn","Sj50oz9EHvD","2015Q4","44.0"],["LYL0E9cqKLn","sWOWPBvwNY2","2016Q1","26.0"],["LYL0E9cqKLn","sWOWPBvwNY2","2015Q4","26.0"],["LYL0E9cqKLn","IgTAEKMqKRe","2016Q1","13.0"],["LYL0E9cqKLn","IgTAEKMqKRe","2015Q4","13.0"],["LYL0E9cqKLn","qarQhOt2OEh","2016Q1","22.0"],["LYL0E9cqKLn","qarQhOt2OEh","2015Q4","22.0"],["LYL0E9cqKLn","Crkg9BoUo5w","2016Q1","31.0"],["LYL0E9cqKLn","Crkg9BoUo5w","2015Q4","31.0"],["LYL0E9cqKLn","EO3Ps3ny0Nr","2016Q1","24.0"],["LYL0E9cqKLn","EO3Ps3ny0Nr","2015Q4","24.0"]],"width":4,"height":756};

  chartData: any = {};
  tableData: any = {};
  visualizer_config = {
    'type': 'table',
    'tableConfiguration': {
      'rows': ['ou', 'dx'] ,
      'columns': ['pe']
    },
    'chartConfiguration': {
      'type':'line',
      'title': 'My chart',
      'xAxisType': 'pe',
      'yAxisType': 'dx'
    }
  };

  icons: any[] = [
    {name: 'table', image: 'table.jpg'},
    {name: 'column', image: 'bar.png'},
    {name: 'line', image: 'line.png'},
    {name: 'combined', image: 'combined.jpg'},
    {name: 'bar', image: 'column.png'},
    {name: 'area', image: 'area.jpg'},
    {name: 'pie', image: 'pie.png'},
    {name: 'radar', image: 'radar.png'},
    {name: 'stacked_column', image: 'column-stacked.png'},
    {name: 'stacked_bar', image: 'bar-stacked.png'},
    {name: 'gauge', image: 'gauge.jpg'}
    ];
  constructor(private filterService: FilterService,
              private visulizationService: VisulizerService,
              private constant: Constants,
              private http: Http
  ) {

  }

  ngOnInit() {
    this.card_organisationunits = this.orgunit_nodes;
    this.card_period_type = this.current_period_type;
    this.card_year = this.current_year;
    this.card_periods = this.filterService.getPeriodArray( this.default_period_type, this.card_year );
    this.chartData = this.visulizationService.drawChart( this.sampledata, this.visualizer_config.chartConfiguration );
    this.tableData = this.visulizationService.drawTable( this.sampledata, this.visualizer_config.tableConfiguration );

  }

  ngAfterViewInit(){
    console.log("Orgunits:",this.default_orgunit);
    console.log("Periods:",this.default_period);
    console.log("Period Type:",this.default_period_type);
    console.log("indicator:", this.indicator);
    this.activateNode( this.default_period.id, this.pertree );
    this.activateNode( this.default_orgunit.id, this.orgtree );

  }

  // a call that will change the view type
  updateIndicatorCard( holders:any, type:string ){
    this.loading = true;

    //make sure that orgunit and period selections are closed
    this.showOrgTree = true;
    this.showPerTree = true;
    // construct metadata array
    let indicatorsArray = [];
    let orgUnitsArray = [];
    let periodArray = [];
    for ( let holder of holders){
      for ( let item of holder.indicators ){
        indicatorsArray.push(item.id);
      }
    }
    for ( let item of this.card_selected_periods ){
      periodArray.push(item.id);
    }for ( let item of this.card_selected_orgunits ){
      orgUnitsArray.push(item.id);
    }

    this.visualizer_config = {
      'type': 'chart',
      'tableConfiguration': {
        'rows': ['ou'] ,
        'columns': ['pe']
      },
      'chartConfiguration': {
        'type':'line',
        'title': 'My chart',
        'xAxisType': 'pe',
        'yAxisType': 'ou'
      }
    };


    // create an api analytics call
    let url = this.constant.root_dir+"api/analytics.json?dimension=dx:" + indicatorsArray.join(";") + "&dimension=ou:" + orgUnitsArray.join(";") + "&dimension=pe:" + periodArray.join(";") + "&displayProperty=NAME";

    this.subscription = this.loadAnalytics(url).subscribe(
      (data) => {
        this.loading = false;
        this.chartData = this.visulizationService.drawChart( data, this.visualizer_config.chartConfiguration );
        this.tableData = this.visulizationService.drawTable( data, this.visualizer_config.tableConfiguration );
      },
      error => {
        console.log(error)
      }
    )

  }

  // a function to reverse the content of X axis and Y axis
  switchXandY(indicator){

  }

  // adding one year to the list of period
  pushPeriodForward(){
    this.card_year += 1;
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type,this.card_year);
  }

  // minus one year to the list of period
  pushPeriodBackward(){
    this.card_year -= 1;
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type,this.card_year);
  }

  // react to period changes
  changePeriodType(){
    this.card_periods = this.filterService.getPeriodArray(this.card_period_type,this.card_year);
  }

  // display Orgunit Tree
  displayOrgTree(){
    this.showOrgTree = !this.showOrgTree;
  }

  // display period Tree
  displayPerTree(){
    this.showPerTree = !this.showPerTree;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivateOrg ( $event ) {
    this.card_selected_orgunits.forEach((item,index) => {
      if( $event.node.data.id == item.id ) {
        this.card_selected_orgunits.splice(index, 1);
      }
    });
  };

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivatePer ( $event ) {
    this.card_selected_periods.forEach((item,index) => {
      if( $event.node.data.id == item.id ) {
        this.card_selected_periods.splice(index, 1);
      }
    });
  };

  // add item to array of selected items when organisation unit is selected
  activateOrg = ($event) => {
    this.card_selected_orgunits.push($event.node.data);
    this.card_orgUnit = $event.node.data;
  };

  // add item to array of selected items when period is selected
  activatePer = ($event) => {
    this.card_selected_periods.push($event.node.data);
    this.card_period = $event.node.data;
  };

  activateNode(nodeId:any, nodes){
    console.log(nodeId);
    setTimeout(() => {
      let node = nodes.treeModel.getNodeById(nodeId);
      if (node)
        // node.toggleActivated();
        node.setIsActive(true);
    }, 0);
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }

  // custom settings for tree
  customTemplateStringOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

  // update chart
  updateChart(){
    this.visualizer_config = {
      'type': 'chart',
      'tableConfiguration': {
        'rows': ['ou', 'dx'] ,
        'columns': ['pe']
      },
      'chartConfiguration': {
        'type':'line',
        'title': 'My chart',
        'xAxisType': 'pe',
        'yAxisType': 'dx'
      }
    };
    this.chartData = this.visulizationService.drawChart( this.sampledata, this.visualizer_config.chartConfiguration );
    this.tableData = this.visulizationService.drawTable( this.sampledata, this.visualizer_config.tableConfiguration );
  }

  // a function to simplify loading of analytics data
  loadAnalytics(url) {
    return this.http.get(url)
      .map((response: Response) => response.json())
      .catch(this.handleError);
  }

  // hide the model
  removeModel(){
    this.show_details.emit(false);
  }

  // handle errors from requests
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  ngOnDestroy (){
    if( this.subscription ){
      this.subscription.unsubscribe();
    }
  }
}
