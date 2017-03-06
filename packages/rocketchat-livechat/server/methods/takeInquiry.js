Meteor.methods({
    'livechat:takeInquiry' (inquiryId) {
        if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
            throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:takeInquiry' });
        }

        const inquiry = RocketChat.models.LivechatInquiry.findOneById(inquiryId);

        if (!inquiry || inquiry.status === 'taken') {
            throw new Meteor.Error('error-not-allowed', 'Inquiry already taken', { method: 'livechat:takeInquiry' });
        }

        const room = RocketChat.models.Rooms.findOneById(inquiry.rid);
        if (room.servedBy && room.servedBy._id) {
            throw new Meteor.Error('error-not-allowed', 'Inquiry already taken', { method: 'livechat:takeInquiry' });
        }

        const user = RocketChat.models.Users.findOneById(Meteor.userId());

        RocketChat.models.LivechatDepartmentAgents.increaseLivechatCount(room.department, user._id);

        const agent = {
            agentId: user._id,
            username: user.username
        };

        // add subscription
        var subscriptionData = {
            rid: inquiry.rid,
            name: inquiry.name,
            alert: true,
            open: true,
            unread: 1,
            code: inquiry.code,
            u: {
                _id: agent.agentId,
                username: agent.username
            },
            t: 'l',
            desktopNotifications: 'all',
            mobilePushNotifications: 'all',
            emailNotifications: 'all'
        };
        RocketChat.models.Subscriptions.insert(subscriptionData);

        const usernames = room.usernames.concat(agent.username);

        RocketChat.models.Rooms.changeAgentByRoomId(inquiry.rid, usernames, agent);

        room.usernames = usernames;
        room.servedBy = {
            _id: agent.agentId,
            username: agent.username
        };

        // mark inquiry as taken
        RocketChat.models.LivechatInquiry.takeInquiry(inquiry._id);

        var assigntoMatrixagent = RocketChat.settings.get('Livechat_AssignToMatrixAgent_Department');
        var departmentsToAssign = assigntoMatrixagent.split(/\s*,\s*/);
        var IsAssign = departmentsToAssign.indexOf(room.departmentname) > -1;
        if (IsAssign) {
            var employeeid = Meteor.users.find({ _id: agent.agentId }).fetch()[0].employeeId;
            Meteor.defer(() => {
                Meteor.call('livechat:assignToMatrixAgent', room.leadid, employeeid, (err, result) => {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        }
        // return room corresponding to inquiry (for redirecting agent to the room route)
        return room;
    }
});