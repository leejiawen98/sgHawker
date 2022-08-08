import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewPendingVaccinationCustomerPage } from './view-pending-vaccination-customer.page';

describe('ViewPendingVaccinationCustomerPage', () => {
  let component: ViewPendingVaccinationCustomerPage;
  let fixture: ComponentFixture<ViewPendingVaccinationCustomerPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPendingVaccinationCustomerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewPendingVaccinationCustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
