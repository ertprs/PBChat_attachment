RocketChat.API.v1.addRoute('livechat/wa-incoming', { authRequired: false }, {
    post() {
        const sms = this.bodyParams;
        var message = {
            _id: Random.id(),
            msg: sms.Body,
            attachments: sms.attachments
        }
        console.log('incoming whatsapp for custid - ' + sms.custid);
        var roomInfo, guest, custinfo, VisitorToken, LeadID;
        var userId = sms.userid;
        LeadID = sms.leadid ? sms.leadid : 0;
        custinfo = {
            name: sms.name,
            email: sms.emailid,
            custid: sms.custid,
            leadid: LeadID,
            departmentid: sms.departmentid,
            departmentname: sms.department,
            waflag: 1,
            mobile: sms.mobileno
        };
        guest = {
            name: sms.name,
            //username: sms.name + "-" + sms.custid,
            email: sms.emailid,
            department: sms.departmentid,
            custid: sms.custid,
            leadid: LeadID,
            mobilenumber: sms.mobileno
        };

        if (sms.roomid) {

            message.rid = sms.roomid;
            guest._id = userId;
            VisitorToken = sms.token
        } else {
            roomInfo = RocketChat.models.Rooms.getOpenRoomByCustIDAndDep(sms.custid, sms.departmentid);
            if (roomInfo && roomInfo != null) {
                message.rid = roomInfo._id;
                guest._id = roomInfo.v._id;
                VisitorToken = roomInfo.v.token;
            } else {
                message.rid = Random.id();
                VisitorToken = Random.id();
                guest.token = VisitorToken;
                userId = RocketChat.Livechat.registerGuest(guest);
                guest._id = userId;

            }
        }

        message.token = VisitorToken;

        try {
            let sent = Meteor.call('sendMessageLivechat', message, custinfo, guest._id);
            sent.userId = userId;
            return sent;
        } catch (e) {
            console.log("Error occured");
            console.log(e);
            return e;
        }
    }
});