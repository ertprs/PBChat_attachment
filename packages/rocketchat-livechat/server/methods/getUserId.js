//new method added by PBChat
Meteor.methods({
	'livechat:getUserId'() {	
        return Meteor.userId();
	}
});
