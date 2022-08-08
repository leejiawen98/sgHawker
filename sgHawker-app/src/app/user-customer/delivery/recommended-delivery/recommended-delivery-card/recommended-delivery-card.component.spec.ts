import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecommendedDeliveryCardComponent } from './recommended-delivery-card.component';

describe('RecommendedDeliveryCardComponent', () => {
  let component: RecommendedDeliveryCardComponent;
  let fixture: ComponentFixture<RecommendedDeliveryCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecommendedDeliveryCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendedDeliveryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
