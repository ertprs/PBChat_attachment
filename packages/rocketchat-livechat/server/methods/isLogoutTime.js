//new method added by PBChat
Meteor.methods({
	'livechat:isLogoutTime'(closingtime) {
		// get current time on server in utc
		var currentTime = moment.utc(moment().utc().format('HH:mm'), 'HH:mm');
		// get clossing hours from db
		var finish = moment.utc(closingtime, 'HH:mm');
		return finish.isSame(currentTime, 'minute');
	}
});
