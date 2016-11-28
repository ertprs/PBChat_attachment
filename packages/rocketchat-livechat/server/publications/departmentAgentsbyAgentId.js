Meteor.publish('livechat:departmentAgentsbyAgentId', function() {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:departmentAgents' }));
	}

	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:departmentAgents' }));
	}

	return RocketChat.models.LivechatDepartmentAgents.findSameDepartmentAgentsByAgentId(this.userId);
});
