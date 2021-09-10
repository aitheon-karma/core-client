import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorsTypographyComponent } from './colors-typography.component';

describe('ColorsTypographyComponent', () => {
  let component: ColorsTypographyComponent;
  let fixture: ComponentFixture<ColorsTypographyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorsTypographyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorsTypographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
