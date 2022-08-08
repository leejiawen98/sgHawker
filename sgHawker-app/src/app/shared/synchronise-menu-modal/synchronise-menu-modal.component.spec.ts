import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SynchroniseMenuModalComponent } from './synchronise-menu-modal.component';

describe('SynchroniseMenuModalComponent', () => {
  let component: SynchroniseMenuModalComponent;
  let fixture: ComponentFixture<SynchroniseMenuModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SynchroniseMenuModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SynchroniseMenuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
