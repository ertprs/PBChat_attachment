Meteor.methods({
	'livechat:findblockedcustomers'() {
        console.log('livechat:findblockedcustomers');
		return RocketChat.models.Users.findblockedvisitors().fetch();
	}
});