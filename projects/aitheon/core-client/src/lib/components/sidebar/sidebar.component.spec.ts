/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SidebarComponent } from './sidebar.component';


describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  onSliderChange(selectedValues: number[]) {
    this._currentValues = selectedValues;
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SidebarComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close sidebar', () => {
    component.close();
    expect(component.opened).toBeFalsy();
  });
});
