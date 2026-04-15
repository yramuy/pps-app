import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssemblyAddComponent } from './assembly-add.component';

describe('AssemblyAddComponent', () => {
  let component: AssemblyAddComponent;
  let fixture: ComponentFixture<AssemblyAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssemblyAddComponent]
    });
    fixture = TestBed.createComponent(AssemblyAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
