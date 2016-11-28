//Added by PBChat
Meteor.methods({
	IsCustomerBlocked: function(message,custinfo) {
		if (!Meteor.userId()) {
	        throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:IsCustomerBlocked' });
		}
        	return Meteor.user().blocked;
	}
});