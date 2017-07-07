Meteor.methods({
    sendMessageLivechat: function(message, custinfo, userId) {
        var guest;
        check(message.rid, String);
        check(message.token, String);
        if (Meteor.userId()) {
            userId = Meteor.userId();
        }
        guest = Meteor.users.findOne(userId, {
            fields: {
                name: 1,
                username: 1,
                department: 1
            }
        });
        return RocketChat.Livechat.sendMessage({ guest: guest, message: message, custinfo: custinfo });
    }
});