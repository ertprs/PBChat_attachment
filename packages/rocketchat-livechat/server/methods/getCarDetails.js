//new method added by PBChat
Meteor.methods({
    'livechat:getCarDetails' (leadid) {
        this.unblock();
        var cardetails = null;
        var url = RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getCarInfo/" + leadid;
        cardetails = HTTP.call("GET", url, { headers: { "accept": "application/json" } }).data;
        return cardetails;
    }
});