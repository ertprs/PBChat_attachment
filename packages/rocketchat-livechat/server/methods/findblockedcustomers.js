Meteor.methods({
    'livechat:findblockedcustomers' () {
        return RocketChat.models.Users.findblockedvisitors().fetch();
    }
});