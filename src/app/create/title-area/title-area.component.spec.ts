import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleAreaComponent } from './title-area.component';

describe('TitleAreaComponent', () => {
  let component: TitleAreaComponent;
  let fixture: ComponentFixture<TitleAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitleAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
