import { TestBed } from '@angular/core/testing';

import { RecommendDeliveryOrderService } from './recommend-delivery-order.service';

describe('RecommendDeliveryOrderService', () => {
  let service: RecommendDeliveryOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendDeliveryOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
