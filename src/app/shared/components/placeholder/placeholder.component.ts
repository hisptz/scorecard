import {Component, Input, OnInit} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
})
export class PlaceholderComponent implements OnInit {

  @Input() loadingMessage = 'Loading...';
  constructor() { }

  ngOnInit() {
  }

}
