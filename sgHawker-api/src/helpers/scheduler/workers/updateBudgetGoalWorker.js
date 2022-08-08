import { User } from 'models';
import { Logger } from 'common';
import moment from 'moment';

const DEBUG_ENV = 'updateBudgetGoalTimeOut';

export default {
    run: function () {
        Logger.info('Update budget goals started', DEBUG_ENV);
        return User.updateCustomerBudgetGoalsForTimeout();
    }
};