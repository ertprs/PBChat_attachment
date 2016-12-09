Meteor.publish('livechat:rooms', function(filter = {}, offset = 0, limit = 20) {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:rooms' }));
	}

	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:rooms' }));
	}
	//Changes by PBChat
	check(filter, {
		name: Match.Maybe(String), // room name to filter
		leadid: Match.Maybe(String), // leadid name to filter//Changes by PBChat
		agent: Match.Maybe(String), // agent _id who is serving
		status: Match.Maybe(String), // either 'opened' or 'closed'
		From: Match.Maybe(String),
		To: Match.Maybe(String),
		department: Match.Maybe(String),
		waitingResponse: Match.Maybe(String)
	});

	let query = {};
	if (filter.name) {
		query.label = new RegExp(filter.name, 'i');
	}
	//Changes by PBChat
	if (filter.leadid) {
		query['leadid'] = Number(filter.leadid);
	}
	if (filter.agent) {
		query['servedBy._id'] = filter.agent;
	}
	if (filter.status) {
		if (filter.status === 'opened') {
			query.open = true;
		} else {
			query.open = { $exists: false };
		}
	}
	if (filter.From && filter.To) {
		var StartDate = new Date(filter.From);
		var EndDate = new Date(filter.To);
		query["ts"] ={$gte: StartDate,$lte:EndDate};
	}else{
		var Today = new Date();
		var Date1 = Today.getFullYear().toString() + '-' + (Today.getMonth()+1).toString() + '-' + (Today.getDate()-1).toString();
		var StartDate = new Date(Date1);
		var nextday = new Date();
		var numberOfDaysToAdd = 1;
		nextday.setDate(nextday.getDate() + numberOfDaysToAdd); 
		var Date2 = nextday.getFullYear().toString() + '-' + (nextday.getMonth()+1).toString() + '-' + nextday.getDate().toString();
		var EndDate = new Date(Date2);
		query["ts"] ={$gte: StartDate,$lte:EndDate};
	}
	if (filter.department) {
		query["department"] = filter.department;
	}
	if (filter.waitingResponse == "true") {
		query["waitingResponse"] = true;
	}
	else if(filter.waitingResponse == "false"){
		query["waitingResponse"] = null;
	}
	return RocketChat.models.Rooms.findLivechat(query, offset, limit);
});


