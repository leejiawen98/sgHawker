import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EchartsComparativeFooditemChartComponent } from './echarts-comparative-fooditem-chart.component';

describe('EchartsComparativeFooditemChartComponent', () => {
  let component: EchartsComparativeFooditemChartComponent;
  let fixture: ComponentFixture<EchartsComparativeFooditemChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EchartsComparativeFooditemChartComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EchartsComparativeFooditemChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
