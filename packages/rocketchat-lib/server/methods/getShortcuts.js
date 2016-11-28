Meteor.methods({
	getShortcuts(agentid) {
        var agentDepartment = RocketChat.models.LivechatDepartmentAgents.findOneByAgentId(agentid);
        var departmentId = agentDepartment.departmentId;
        let options = {
			sort: { _id : 1}
		};
        var Departmentinfo = RocketChat.models.LivechatDepartment.findOneById(agentDepartment.departmentId, options);
        return Departmentinfo.shortcuts;
	}
});
