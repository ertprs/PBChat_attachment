//new method added by PBChat
Meteor.methods({
	'livechat:getRoom'(rid) {
		const room = RocketChat.models.Rooms.findOneById(rid);
		return room;
	}
});
