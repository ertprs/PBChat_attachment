//new method added by PBChat
Meteor.methods({
    'livechat:getHealthDetails' (leadid) {
        this.unblock();
        var healthdetails = null;
        var url = RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getHealthInfo/" + leadid;
        healthdetails = HTTP.call("GET", url, { headers: { "accept": "application/json" } }).data;
        return healthdetails;
    }
});