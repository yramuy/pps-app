import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteFooterComponent } from './website-footer.component';

describe('WebsiteFooterComponent', () => {
  let component: WebsiteFooterComponent;
  let fixture: ComponentFixture<WebsiteFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebsiteFooterComponent]
    });
    fixture = TestBed.createComponent(WebsiteFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
