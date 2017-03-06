Meteor.publish('livechat:departmentAgents', function(departmentId = null) {
    if (!this.userId) {
        return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:departmentAgents' }));
    }
    if (departmentId) {
        return RocketChat.models.LivechatDepartmentAgents.find({ departmentId: departmentId });
    } else {
        return RocketChat.models.LivechatDepartmentAgents.find();
    }

});