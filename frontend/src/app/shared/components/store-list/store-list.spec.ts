import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StoreList } from './store-list';

describe('StoreList', () => {
  let component: StoreList;
  let fixture: ComponentFixture<StoreList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreList, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
