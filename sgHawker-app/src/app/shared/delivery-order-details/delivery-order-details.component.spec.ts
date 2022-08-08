import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeliveryOrderDetailsComponent } from './delivery-order-details.component';

describe('DeliveryOrderDetailsComponent', () => {
  let component: DeliveryOrderDetailsComponent;
  let fixture: ComponentFixture<DeliveryOrderDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryOrderDetailsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
