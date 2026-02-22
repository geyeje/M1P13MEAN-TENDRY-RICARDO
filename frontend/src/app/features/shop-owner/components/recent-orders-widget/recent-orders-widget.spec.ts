import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentOrdersWidget } from './recent-orders-widget';

describe('RecentOrdersWidget', () => {
  let component: RecentOrdersWidget;
  let fixture: ComponentFixture<RecentOrdersWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentOrdersWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentOrdersWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
