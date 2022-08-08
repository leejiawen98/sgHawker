import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EchartsComparativeGraphComponent } from './echarts-comparative-graph.component';

describe('EchartsComparativeGraphComponent', () => {
  let component: EchartsComparativeGraphComponent;
  let fixture: ComponentFixture<EchartsComparativeGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EchartsComparativeGraphComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EchartsComparativeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
