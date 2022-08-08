import { GoalPeriodEnum } from './../enums/goal-period-enum';
import { GoalCategoryEnum } from './../enums/goal-category-enum';
export class Goal {
  _id: string | undefined;
  goalStartDate: Date | undefined;
  goalEndDate: Date | undefined;
  goalPeriod: GoalPeriodEnum | undefined;
  goalCategory: GoalCategoryEnum | undefined;
  targetAmount: number | undefined;
  color: string | undefined;

  constructor(
      _id?: string,
      goalStartDate?: Date,
      goalEndDate?: Date,
      goalPeriod?: GoalPeriodEnum,
      goalCategory?: GoalCategoryEnum,
      targetAmount?: number,
      color?: string
    ) {
      this._id = _id;
      this.goalStartDate = goalStartDate;
      this.goalEndDate = goalEndDate;
      this.goalPeriod = goalPeriod;
      this.goalCategory = goalCategory;
      this.targetAmount = targetAmount;
      this.color = color;
    }

};
