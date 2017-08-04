//Employee = new Mongo.Collection("RevisitCustomers");

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './Revist.html';

Template.Revist.helpers({
  Employee: function () {
    return Employee.find();
  },
});

Template.Revist.onCreated(function () {
  Session.set('userid', FlowRouter.getQueryParam('userId'));
  // this.autorun(() => {
  //   this.subscribe("employeeData", Session.get('userid'));
  // });
  Meteor.subscribe("employeeData", Session.get('userid'));
});


Template.Revist.rendered = function () {
};





