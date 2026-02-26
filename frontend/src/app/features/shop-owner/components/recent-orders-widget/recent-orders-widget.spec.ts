import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentOrdersWidgetComponent } from './recent-orders-widget';

describe('RecentOrdersWidget', () => {
  let component: RecentOrdersWidgetComponent;
  let fixture: ComponentFixture<RecentOrdersWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentOrdersWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentOrdersWidgetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
