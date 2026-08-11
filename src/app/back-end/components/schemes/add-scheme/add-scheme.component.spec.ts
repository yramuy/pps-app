import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchemeComponent } from './add-scheme.component';

describe('AddSchemeComponent', () => {
  let component: AddSchemeComponent;
  let fixture: ComponentFixture<AddSchemeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSchemeComponent]
    });
    fixture = TestBed.createComponent(AddSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
