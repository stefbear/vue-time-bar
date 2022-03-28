import Vue from "vue";

const settings = {
    //date range small increment/decrement amount in number of days
    DATE_STEP_INCREMENT_DAYS: 7,
    //date range large increment/decrement amount in number of days
    DATE_SKIP_INCREMENT_DAYS: 365,   
};

Vue.use(settings);

export default settings;
