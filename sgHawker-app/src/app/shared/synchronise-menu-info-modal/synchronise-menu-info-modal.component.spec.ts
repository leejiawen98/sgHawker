import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SynchroniseMenuInfoModalComponent } from './synchronise-menu-info-modal.component';

describe('SynchroniseMenuInfoModalComponent', () => {
  let component: SynchroniseMenuInfoModalComponent;
  let fixture: ComponentFixture<SynchroniseMenuInfoModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SynchroniseMenuInfoModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SynchroniseMenuInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
