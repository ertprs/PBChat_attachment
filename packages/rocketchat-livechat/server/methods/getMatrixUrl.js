//new method added by PBChat
Meteor.methods({
    'livechat:getMatrixUrl' (rid, service) {
        const room = RocketChat.models.Rooms.findOneById(rid);
        if (service) {
            var showBookingDetails = RocketChat.settings.get('showBookingDetails');
            var userId = Meteor.userId();
            var user = Meteor.users.find({ _id: userId }).fetch()[0];
            if (showBookingDetails) {
                var url = RocketChat.settings.get('BMS') + 'empId=' + user.employeeId + '&bookingId=' + room.leadid;
                return url;
            } else {
                return 'false';
            }
        } else {
            var showSalesView = RocketChat.settings.get('showSalesView');
            if (showSalesView) {
                var url = RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getMatrixURL/" + room.leadid + "/" + room.custid + "/" + Meteor.userId();
                return HTTP.call("GET", url, { headers: { "accept": "application/json" } }).data;
            } else {
                return 'false';
            }
        }
    }
});