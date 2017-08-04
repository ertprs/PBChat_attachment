import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  Meteor.publish("employeeData", function (userId) {
    console.log(userId);
    var today = new Date().getHours();
    console.log(today);
    if (today < 11) {
      let lastHour = moment().subtract(1, 'hour')
      return Employee.find(
        {
          "ts": {
            $gte: new Date(lastHour)
          }
        }
      );
    }
    else {
      let lastHour = moment().subtract(13, 'hour')
      return Employee.find({
        "ts": {
          $gte: new Date(lastHour)
        }, "AgentId": parseInt(userId)
      });
    }
  });
});

