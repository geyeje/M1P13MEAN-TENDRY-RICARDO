import { TestBed } from '@angular/core/testing';

import { ShopData } from './shop-data';

describe('ShopData', () => {
  let service: ShopData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
