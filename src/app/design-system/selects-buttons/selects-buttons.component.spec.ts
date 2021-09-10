import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectsButtonsComponent } from './selects-buttons.component';

describe('SelectsButtonsComponent', () => {
  let component: SelectsButtonsComponent;
  let fixture: ComponentFixture<SelectsButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectsButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectsButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
