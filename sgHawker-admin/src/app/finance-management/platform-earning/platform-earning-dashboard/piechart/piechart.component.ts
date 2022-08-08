import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss'],
})
export class PiechartComponent implements OnInit {

  @Input() results: any[] = [
    {
      name: 'No data',
      value: 'No data'
    }
  ]
  @Input() chartTitle: string;

  showLegend: boolean = true;
  showLabels: boolean = true;
  gradient: boolean = false;
  isDoughnut: boolean = false;
  legendPosition: string = 'below';

  colorScheme = {
    domain: [
      "rgba(60, 141, 188, 0.6)",
      "rgba(0, 192, 239, 0.6)",
      "rgba(0, 166, 90, 0.6)",
      "rgba(243, 156, 18, 0.6)",
      "rgba(245, 105, 84, 0.6)",
      "rgba(0, 31, 63, 0.6)",
      "rgba(57, 204, 204, 0.6)",
      "rgba(96, 92, 168, 0.6)",
      "rgba(255, 133, 27, 0.6)",
      "rgba(216, 27, 96, 0.6)",

      "rgba(0, 166, 90, 0.6)",
      "rgba(245, 105, 84, 0.6)",
      "rgba(55, 160, 225, 0.6)",
      "rgba(90, 160, 225, 0.6)",
      "rgba(70, 160, 225, 0.6)",
      "rgba(120, 160, 225, 0.6)",
      "rgba(180, 160, 225, 0.6)",
      "rgba(220, 160, 225, 0.6)",
      "rgba(26, 147, 111, 0.6)",
      "rgba(136, 212, 152, 0.6)",

      "rgba(244, 159, 10, 0.6)",
      "rgba(237, 199, 207, 0.6)",
      "rgba(153, 153, 195, 0.6)",
      "rgba(9, 129, 74, 0.6)",
      "rgba(205, 83, 52, 0.6)",
      "rgba(46, 40, 42, 0.6)",
      "rgba(184, 186, 200, 0.6)",
      "rgba(170, 120, 166, 0.6)",
      "rgba(178, 255, 214)",
      "rgba(215, 253, 240)"
    ]
  };

  constructor() { }

  ngOnInit() { }

  valueFormat(data) {
    return '$' + data;
  }

}
