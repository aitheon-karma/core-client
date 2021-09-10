import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsInputsComponent } from './forms-inputs.component';

describe('FormsInputsComponent', () => {
  let component: FormsInputsComponent;
  let fixture: ComponentFixture<FormsInputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormsInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormsInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
