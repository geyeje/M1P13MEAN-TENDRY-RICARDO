import { TestBed } from '@angular/core/testing';

import { ShoppingCartService } from './shopping-cart.service';

describe('ShoppingCartService', () => {
  let service: ShoppingCartService;
  const dummyProduct = { _id: 'p1', name: 'Test', price: 10 } as any;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds items and computes count', () => {
    service.add(dummyProduct);
    expect(service.items().length).toBe(1);
    service.add(dummyProduct);
    expect(service.items()[0].quantity).toBe(2);
  });

  it('updates quantity correctly', () => {
    service.add(dummyProduct);
    service.updateQuantity('p1', 5);
    expect(service.items()[0].quantity).toBe(5);
  });

  it('removes item when quantity set to zero', () => {
    service.add(dummyProduct);
    service.updateQuantity('p1', 0);
    expect(service.items().length).toBe(0);
  });

  it('persists to localStorage', () => {
    service.add(dummyProduct);
    const saved = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
    expect(saved.length).toBe(1);
  });

  it('clears the cart', () => {
    service.add(dummyProduct);
    service.clear();
    expect(service.items().length).toBe(0);
  });
});
