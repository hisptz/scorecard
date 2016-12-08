import { Component, OnInit } from '@angular/core';
import {Http} from "@angular/http";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  legends_definitions: any[];
  color: string = "#127bdc";
  constructor(private http: Http) {
    this.legends_definitions = [
      {
        color: "#0F7F11",
        definition: "Target achieved / on track"
      },
      {
        color: "#FFFD38",
        definition: "Progress, but more effort required"
      },
      {
        color: "#FD0C1C",
        definition: "Not on track"
      },
      {
        color: "#D3D3D3",
        definition: "N/A"
      },
      {
        color: "#FFFFFF",
        definition: "No data"
      }
    ];
  }

  ngOnInit() {
  }

}
