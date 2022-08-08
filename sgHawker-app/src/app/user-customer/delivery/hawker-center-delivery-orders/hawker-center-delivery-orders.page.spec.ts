import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HawkerCenterDeliveryOrdersPage } from './hawker-center-delivery-orders.page';

describe('HawkerCenterDeliveryOrdersPage', () => {
  let component: HawkerCenterDeliveryOrdersPage;
  let fixture: ComponentFixture<HawkerCenterDeliveryOrdersPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HawkerCenterDeliveryOrdersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HawkerCenterDeliveryOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
