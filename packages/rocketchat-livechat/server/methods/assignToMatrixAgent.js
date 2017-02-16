//new method added by PBChat
Meteor.methods({
    'livechat:assignToMatrixAgent' (leadid, employeeid) {
        console.log(leadid + ' assigned to ' + employeeid);
        this.unblock();
        var url = RocketChat.settings.get('CTCAPI') + "/CTCRestService.svc/AssignCTC/" + leadid + employeeid + "/0/0/2/0";
        HTTP.call("GET", url, { headers: { "accept": "application/json" } });
    }
});