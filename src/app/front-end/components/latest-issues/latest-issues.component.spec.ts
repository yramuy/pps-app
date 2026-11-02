import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestIssuesComponent } from './latest-issues.component';

describe('LatestIssuesComponent', () => {
  let component: LatestIssuesComponent;
  let fixture: ComponentFixture<LatestIssuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LatestIssuesComponent]
    });
    fixture = TestBed.createComponent(LatestIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
