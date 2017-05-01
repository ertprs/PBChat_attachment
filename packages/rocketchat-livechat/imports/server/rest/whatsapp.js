RocketChat.API.v1.addRoute('livechat/wa-incoming', { authRequired: false }, {
    post() {
        const sms = this.bodyParams;
        var message = {
            _id: Random.id(),
            msg: sms.Body
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
            waflag: 1
        };
        if (userId && userId != null) {
            visitor = RocketChat.models.Users.findOneById(userId);
            guest = visitor;
            VisitorToken = visitor.profile.token;
        } else {
            VisitorToken = Random.id();
            guest = {
                token: VisitorToken,
                name: sms.name,
                //username: sms.name + "-" + sms.custid,
                email: sms.emailid,
                department: sms.departmentid,
                custid: sms.custid,
                leadid: LeadID,
                mobilenumber: sms.mobileno
            };
            userId = RocketChat.Livechat.registerGuest(guest);
            guest._id = userId;
        }
        if (sms.roomid) {
            roomInfo = RocketChat.models.Rooms.findOneById(sms.roomid);
            message.rid = roomInfo._id;
        } else {
            message.rid = Random.id();
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