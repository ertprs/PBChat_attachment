Meteor.methods({
	logoutPreviousTokens(agentid) {
        var length=Meteor.user().services.resume.loginTokens.length;
        var tokens = Meteor.user().services.resume.loginTokens;
        if(length > 1){
                tokens.splice(0,length-1);
                RocketChat.models.Users.update({"_id":agentid}, {"$set" : {"services.resume.loginTokens" : tokens}});
                }
	}
});