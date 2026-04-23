import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedToMeIssuesComponent } from './assigned-to-me-issues.component';

describe('AssignedToMeIssuesComponent', () => {
  let component: AssignedToMeIssuesComponent;
  let fixture: ComponentFixture<AssignedToMeIssuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignedToMeIssuesComponent]
    });
    fixture = TestBed.createComponent(AssignedToMeIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
