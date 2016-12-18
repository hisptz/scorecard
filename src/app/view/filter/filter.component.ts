import { Component, OnInit } from '@angular/core';
import {Constants} from "../../shared/costants";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  showTree:boolean = false;
  base_url: string = "../../../";
  tree_config: any = {
    show_search : false,
    search_text : 'Search',
    level: null,
    loading_message: 'Loading Organisation units...'
  };
  constructor(private costant: Constants) {
    this.base_url = this.costant.root_dir;
  }

  ngOnInit() {
  }

  displayTree(){
    this.showTree = true;
  }

}
