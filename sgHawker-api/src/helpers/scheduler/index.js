import { CronJob } from "cron";
import accountActivityWorker from "./workers/accountActivityWorker";
import removeIdleCashOrderWorker from "./workers/removeIdleCashOrderWorker";
import fetchAdvanceTakeawayOrderWorker from "./workers/fetchAdvanceTakeawayOrderWorker";
import fetchNewPaidOrderWorker from "./workers/fetchNewPaidOrderWorker";
import fetchNewCashOrderWorker from "./workers/fetchNewCashOrderWorker";
import debitWalletWorker from "./workers/debitWalletWorker";
import debitSubscriptionWorker from "./workers/debitSubscriptionWorker";
import updateBudgetGoalWorker from "./workers/updateBudgetGoalWorker";
import moment from "moment";

const DEBUG_ENV = "scheduler";
export default {
  start: function () {
    /*
      Runs every night at 23:59:00 PM
     */
    // new CronJob(
    //   "59 23 * * *",
    //   function () {
    //     accountActivityWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );

    // new CronJob(
    //   "59 23 * * *",
    //   function () {
    //     debitWalletWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );

    // new CronJob(
    //   // "59 23 * * *",
    //   function () {
        // debitSubscriptionWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );

    /**
      Runs every minute
    */

    // new CronJob('* * * * *', function () {
    //   removeIdleCashOrderWorker.run();
    // }, null, true, '');

    // new CronJob(
    //   "* * * * *",
    //   function () {
    //     fetchAdvanceTakeawayOrderWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );

    // new CronJob(
    //   "* * * * *",
    //   function () {
    //     fetchNewPaidOrderWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );

    // new CronJob(
    //   "* * * * *",
    //   function () {
    //     fetchNewCashOrderWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );

    // new CronJob(
    //   "0 0 1 * *",
    //   function () {
    //     updateBudgetGoalWorker.run();
    //   },
    //   null,
    //   true,
    //   ""
    // );
  },
};
