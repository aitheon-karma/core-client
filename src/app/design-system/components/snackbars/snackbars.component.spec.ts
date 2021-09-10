import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarsComponent } from './snackbars.component';

describe('SnackbarsComponent', () => {
  let component: SnackbarsComponent;
  let fixture: ComponentFixture<SnackbarsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnackbarsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
