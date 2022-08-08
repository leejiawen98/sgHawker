import { GoalPeriodEnum } from './../../../models/enums/goal-period-enum';
import { Outlet } from 'src/app/models/outlet';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { GoalCategoryEnum } from './../../../models/enums/goal-category-enum';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Goal } from 'src/app/models/submodels/goal';

@Component({
  selector: 'app-add-goal',
  templateUrl: './add-goal.page.html',
  styleUrls: ['./add-goal.page.scss'],
})
export class AddGoalPage implements OnInit {

  @Input() outlet: Outlet;
  @Input() cat: GoalCategoryEnum;
  dateToday: string;
  maxDate: string;
  newGoal: Goal;

  periodSelections = [
    { label: 'Targeted Date', value: GoalPeriodEnum.TARGETED },
    { label: 'Daily', value: GoalPeriodEnum.DAILY},
    { label: 'Weekly', value: GoalPeriodEnum.WEEKLY},
    { label: 'Monthly', value: GoalPeriodEnum.MONTHLY},
    { label: 'Yearly', value: GoalPeriodEnum.YEARLY},
  ];

  constructor(public modalController: ModalController,
              private analyticService: AnalyticsService,
              public alertController: AlertController) { }

  ngOnInit() {
    this.dateToday = new Date().toISOString().split('T')[0];
    const date = new Date();
    date.setDate(date.getDate() + 3650);
    this.maxDate = date.toISOString().split('T')[0];
    this.newGoal = new Goal();
    if(this.cat === 'SALES') {
      this.newGoal.goalCategory = GoalCategoryEnum.SALES;
    } else if(this.cat === 'EARNINGS') {
      this.newGoal.goalCategory = GoalCategoryEnum.EARNINGS;
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }
  isColor(strColor){
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
  }

  validateForm() {
    if(this.newGoal.goalPeriod === undefined || this.newGoal.goalCategory === undefined ||
      this.newGoal.targetAmount === undefined) {
        return false;
    }
    if(this.newGoal.goalPeriod === GoalPeriodEnum.TARGETED &&
      (this.newGoal.goalStartDate === undefined || this.newGoal.goalEndDate === undefined)) {
        return false;
    }
    if(this.newGoal.goalStartDate > this.newGoal.goalEndDate) {
      return false;
    }

    return true;
  }

  async submitGoal() {

    if(this.validateForm()) {
      if(this.newGoal.goalPeriod !== GoalPeriodEnum.TARGETED) {
        this.newGoal.goalStartDate = null;
        this.newGoal.goalEndDate = null;
      }

      this.analyticService.createGoal(this.outlet._id, this.newGoal).subscribe(
        async updatedOutlet => {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Success',
            message: 'Goal has been created',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.modalController.dismiss(updatedOutlet);
                }
              }
            ]
          });
          await alert.present();
        },
        error => {
          this.alertController
          .create({
            header: 'Hmm..something went wrong',
            message: 'Unable to create goal: ' + error,
            buttons: [
              {
                text: 'Dismiss',
                role: 'cancel',
              },
            ],
          })
          .then((alertElement) => {
            alertElement.present();
          });
        }
      );
    } else {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Unable to Create',
        message: 'Please ensure that all inputs are inputted. Targeted Amount should be number and a color should be selected.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      });
      await alert.present();
    }
  }

}
