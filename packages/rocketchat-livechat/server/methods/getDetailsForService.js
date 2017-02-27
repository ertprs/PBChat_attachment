//new method added by PBChat
Meteor.methods({
    'livechat:getDetailsForService' (leadid, isservice = 0, mobileno = 0, product = '') {
        //this.unblock();
        var url = RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getCustInfo/" + leadid;
        if (leadid == 0) {
            url = url + '?isservice=' + isservice + '&mobileno=' + mobileno + '&product=' + product;
        }
        var customerdetails = HTTP.call("GET", url, { headers: { "accept": "application/json" } }).data;
        return customerdetails;
    }
});