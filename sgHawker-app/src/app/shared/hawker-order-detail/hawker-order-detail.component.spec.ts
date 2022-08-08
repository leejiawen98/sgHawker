import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HawkerOrderDetailComponent } from './hawker-order-detail.component';

describe('HawkerOrderDetailComponent', () => {
  let component: HawkerOrderDetailComponent;
  let fixture: ComponentFixture<HawkerOrderDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HawkerOrderDetailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HawkerOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
