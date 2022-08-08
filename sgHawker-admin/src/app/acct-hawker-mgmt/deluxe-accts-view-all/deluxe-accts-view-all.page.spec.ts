import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeluxeAcctsViewAllPage } from './deluxe-accts-view-all.page';

describe('DeluxeAcctsViewAllPage', () => {
  let component: DeluxeAcctsViewAllPage;
  let fixture: ComponentFixture<DeluxeAcctsViewAllPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeluxeAcctsViewAllPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeluxeAcctsViewAllPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
