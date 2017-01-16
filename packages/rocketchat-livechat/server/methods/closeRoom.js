Meteor.methods({
    'livechat:closeRoom' (roomId, comment) {

        if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'close-livechat-room')) {
            throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });
        }

        const room = RocketChat.models.Rooms.findOneById(roomId);

        const user = Meteor.user();

        if (room.usernames.indexOf(user.username) === -1 && !RocketChat.authz.hasPermission(Meteor.userId(), 'close-others-livechat-room')) {
            throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });
        }

        Meteor.call('livechat:sendTranscript', roomId, RocketChat.settings.get('Livechat_offline_email_' + room.departmentname), room, (err) => {
            if (err) {
                console.error(err);
            }
        });

        return RocketChat.Livechat.closeRoom({
            user: user,
            room: room,
            comment: comment
        });
    }
});