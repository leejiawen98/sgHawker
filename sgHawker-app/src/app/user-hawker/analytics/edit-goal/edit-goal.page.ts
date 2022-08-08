import { GoalCategoryEnum } from './../../../models/enums/goal-category-enum';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { ModalController, AlertController } from '@ionic/angular';
import { Goal } from 'src/app/models/submodels/goal';
import { Component, Input, OnInit } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import { GoalPeriodEnum } from 'src/app/models/enums/goal-period-enum';

@Component({
  selector: 'app-edit-goal',
  templateUrl: './edit-goal.page.html',
  styleUrls: ['./edit-goal.page.scss'],
})
export class EditGoalPage implements OnInit {

  @Input() outlet: Outlet;
  @Input() goal: Goal;
  @Input() progress: number;

  dateToday: string;
  maxDate: string;
  content: string;

  periodSelections = [
    { label: 'Targeted Date', value: GoalPeriodEnum.TARGETED },
    { label: 'Daily', value: GoalPeriodEnum.DAILY},
    { label: 'Weekly', value: GoalPeriodEnum.WEEKLY},
    { label: 'Monthly', value: GoalPeriodEnum.MONTHLY},
    { label: 'Yearly', value: GoalPeriodEnum.YEARLY},
  ];

  constructor(public modalController: ModalController,
              private analyticsService: AnalyticsService,
              private alertController: AlertController) { }

  ngOnInit() {
    // //MIN & MAX configuration for datePicker
    // this.dateToday = new Date().toISOString().split('T')[0];
     const date = new Date();
     date.setDate(date.getDate() + 3650);
     this.maxDate = date.toISOString().split('T')[0];

     if(this.goal.goalCategory === GoalCategoryEnum.SALES) {
      this.content = "Sales";
     } else if (this.goal.goalCategory === GoalCategoryEnum.EARNINGS) {
       this.content = "Earnings";
     }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  validateForm() {
    if(this.goal.goalPeriod === undefined || this.goal.goalCategory === undefined ||
      this.goal.targetAmount === undefined) {
        return false;
    }
    if(this.goal.goalPeriod === GoalPeriodEnum.TARGETED &&
      (this.goal.goalStartDate === undefined || this.goal.goalEndDate === undefined)) {
        return false;
    }
    if(this.goal.goalStartDate > this.goal.goalEndDate) {
      return false;
    }

    return true;
  }

  async update() {
    if(this.validateForm()) {
      if(this.goal.goalPeriod !== GoalPeriodEnum.TARGETED) {
        this.goal.goalStartDate = null;
        this.goal.goalEndDate = null;
      }

      this.analyticsService.updateGoal(this.outlet._id, this.goal).subscribe(
        async retrievedOutlet => {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Success',
            message: 'Goal has been updated',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.modalController.dismiss({outlet: retrievedOutlet, goal: this.goal});
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
            message: 'Unable to update goal: ' + error,
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
        header: 'Unable to update',
        message: 'Please ensure that all inputs are inputted. Targeted Amount should be number.',
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
