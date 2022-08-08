import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlatformEarningDashboardPage } from './platform-earning-dashboard.page';

describe('PlatformEarningDashboardPage', () => {
  let component: PlatformEarningDashboardPage;
  let fixture: ComponentFixture<PlatformEarningDashboardPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatformEarningDashboardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformEarningDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
