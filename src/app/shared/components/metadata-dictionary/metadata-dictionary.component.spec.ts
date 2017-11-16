import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataDictionaryComponent } from './metadata-dictionary.component';

describe('MetadataDictionaryComponent', () => {
  let component: MetadataDictionaryComponent;
  let fixture: ComponentFixture<MetadataDictionaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataDictionaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
