/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding", "Match.Optional"]}] 
file addded by pbchat
*/

Meteor.methods({
	'getLeadId'(_id) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:getLeadId' });
		}
		return RocketChat.models.Rooms.findOneById(_id);				
	}
});
