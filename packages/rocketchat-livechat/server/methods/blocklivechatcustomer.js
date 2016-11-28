Meteor.methods({
	'livechat:blocklivechatcustomer'(_id,Isblock) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });
		}
        return RocketChat.Livechat.updateBlockCustomer(_id,Isblock);
	}
});