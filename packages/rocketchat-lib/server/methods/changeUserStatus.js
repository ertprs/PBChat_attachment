Meteor.methods({
	changeUserStatus(agentid) {
        if(agentid){
                RocketChat.models.Users.update({"_id":agentid}, {"$set" : {"status" : "offline","statusConnection":"offline"}});
                }
	}
});