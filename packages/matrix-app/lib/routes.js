
FlowRouter.route('/client', {
	name: 'client',
	 action: function() {
	 	BlazeLayout.render('Revist', {template: 'tasks'});
	}
});