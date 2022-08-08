import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AdjustSubscriptionFeeModalPage } from './adjust-subscription-fee-modal.page';

describe('AdjustSubscriptionFeeModalPage', () => {
  let component: AdjustSubscriptionFeeModalPage;
  let fixture: ComponentFixture<AdjustSubscriptionFeeModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustSubscriptionFeeModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdjustSubscriptionFeeModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
