/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding", "Match.Optional"]}] 
file addded by pbchat
*/

Meteor.methods({
	'getDepartmentAgents'(_id) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:departmentAgents' });
		}
		return RocketChat.models.LivechatDepartmentAgents.findSameDepartmentAgentsByAgentId(_id).fetch();				
	}
});
