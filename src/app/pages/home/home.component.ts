import { Component, OnInit } from '@angular/core';
import { CardsService } from '../../core/services/cards.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  scorecards: Object;
  config: any;
  count: any;

  public labels: any = {};

  constructor(private data: CardsService) {

    this.config = {
      itemsPerPage: 4,
      currentPage: 1,
      totalItems: this.count
    };
  }
 
  pageChanged(event){
    this.config.currentPage = event;

   }

  ngOnInit() {
    this.data.getCards().subscribe(data => {
      this.scorecards = data
    }
  );
  }

}
