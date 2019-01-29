import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvertedViewComponent } from './inverted-view.component';

describe('InvertedViewComponent', () => {
  let component: InvertedViewComponent;
  let fixture: ComponentFixture<InvertedViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvertedViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvertedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
