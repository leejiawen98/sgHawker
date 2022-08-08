import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AllRecommendedDeliveryModalComponent } from './all-recommended-delivery-modal.component';

describe('AllRecommendedDeliveryModalComponent', () => {
  let component: AllRecommendedDeliveryModalComponent;
  let fixture: ComponentFixture<AllRecommendedDeliveryModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllRecommendedDeliveryModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AllRecommendedDeliveryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
