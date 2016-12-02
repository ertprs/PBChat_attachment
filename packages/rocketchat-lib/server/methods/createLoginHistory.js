Meteor.methods({
	createLoginHistory(agentid,department,action) {       
        var record = {
			agentid: agentid,
			department: department,
			action: action,			
		     };	

        RocketChat.models.LoginHistory.createloginhistory(record);        
    }        
});