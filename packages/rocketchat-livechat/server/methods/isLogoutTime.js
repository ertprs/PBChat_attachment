//new method added by PBChat
Meteor.methods({
	'livechat:isLogoutTime'(departmentname) {
		// get current time on server in utc
		var currentTime = moment.utc(moment().utc().format('HH:mm'), 'HH:mm');
		// get clossing hours from db
		var closingtime = RocketChat.settings.get('Livechat_Agent_LogoutTime_' + departmentname);
		var finish = moment.utc(closingtime, 'HH:mm');
		return finish.isSame(currentTime, 'minute');
	}
});
