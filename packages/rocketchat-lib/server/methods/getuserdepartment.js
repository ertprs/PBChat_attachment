Meteor.methods({
	getuserdepartment(agentid) {                
                var agentDepartment = RocketChat.models.LivechatDepartmentAgents.findOneByAgentId(agentid);
                var department = RocketChat.models.LivechatDepartment.findOneById(agentDepartment.departmentId);
                if(agentDepartment){
                        return department;
                }
                else{
                        return null;
                }
	}
});