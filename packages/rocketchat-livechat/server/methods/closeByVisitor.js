Meteor.methods({
    'livechat:closeByVisitor' (rid) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeByVisitor' });
        }
        //const room = RocketChat.models.Rooms.findOneOpenByVisitorId(Meteor.userId());
        var room = RocketChat.models.Rooms.findOne({ _id: rid });
        if (!room || !room.open) {
            return false;
        }

        const user = Meteor.user();

        let language = (user && user.language) || RocketChat.settings.get('language') || 'en';

        return RocketChat.Livechat.closeRoom({
            user: user,
            room: room,
            comment: TAPi18n.__('Closed_by_visitor', { lng: language })
        });
    }
});