//new method added by PBChat
Meteor.methods({
    'livechat:getAgentDepartments' (agentid) {
        const department = _.pluck(RocketChat.models.LivechatDepartmentAgents.findAllByAgentId(agentid).fetch(), 'departmentId');
        return department;
    }
});