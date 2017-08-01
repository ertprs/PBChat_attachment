RocketChat.QueueMethods = {
    /* Least Amount Queuing method:
     *
     * default method where the agent with the least number
     * of open chats is paired with the incoming livechat
     */
    'Least_Amount': function(guest, message, roomInfo, custinfo) {
        var childleadid;
        if (custinfo && custinfo.chatleadid) {
            childleadid = custinfo.chatleadid;
        } else {
            childleadid = custinfo.leadid;
        }
        const agent = RocketChat.Livechat.getNextAgent(custinfo.departmentid);
        if (agent === 'Guest_Pool') {
            return RocketChat.QueueMethods['Guest_Pool'](guest, message, roomInfo, custinfo);
        } else {
            var date = new Date();
            var Departmentinfo = RocketChat.models.LivechatDepartment.findOneById(custinfo.departmentid, options);
            var departmentname = Departmentinfo.name;
            var IsService = departmentname.match("_Service");
            if (IsService) {
                var response = 'service chat';
            } else {
                var url = RocketChat.settings.get('MRSAPI') + "/CustomerInteraction/SetCustInteraction";
                StartDate = (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString() + ' ' + date.getHours().toString() + ':' + date.getMinutes().toString() + ':' + date.getSeconds().toString();
                HTTP.call("POST", url, {
                        data: { "item": { "Data": { "LeadId": childleadid, "CustId": custinfo.custid, "StartDate": StartDate, "IntractionType": "1" } } },
                        headers: { "Authorization": "cG9saWN5 YmF6YWFy" }
                    },
                    function(error, result) {
                        if (!error) {}
                    });
            }
            let options = {
                sort: { _id: 1 }
            };

            const roomCode = RocketChat.models.Rooms.getNextLivechatRoomCode();

            const room = _.extend({
                _id: message.rid,
                msgs: 1,
                lm: new Date(),
                code: roomCode,
                label: custinfo.name,
                usernames: [agent.username, guest.username],
                t: 'l',
                ts: date,
                v: {
                    _id: guest._id,
                    token: message.token
                },
                servedBy: {
                    _id: agent.agentId,
                    username: agent.username
                },
                cl: false,
                open: true,
                waitingResponse: true,
                leadid: custinfo.leadid,
                custid: custinfo.custid,
                department: custinfo.departmentid,
                departmentname: departmentname,
                chatleadid: childleadid
            }, roomInfo);
            if (custinfo.waflag == 1) {
                room.waflag = 1;
            }
            if (custinfo.source && custinfo.source != '') {
                room.source = custinfo.source;
            }
            let subscriptionData = {
                rid: message.rid,
                name: guest.name || guest.username,
                alert: true,
                open: true,
                unread: 1,
                code: roomCode,
                u: {
                    _id: agent.agentId,
                    username: agent.username
                },
                t: 'l',
                desktopNotifications: 'all',
                mobilePushNotifications: 'all',
                emailNotifications: 'all'
            };
            RocketChat.models.Rooms.insert(room);
            RocketChat.models.Subscriptions.insert(subscriptionData);

            var assigntoMatrixagent = RocketChat.settings.get('Livechat_AssignToMatrixAgent_Department');
            var departmentsToAssign = assigntoMatrixagent.split(/\s*,\s*/);
            var IsAssign = departmentsToAssign.indexOf(departmentname) > -1;
            if (IsAssign) {
                var employeeid = Meteor.users.find({ _id: agent.agentId }).fetch()[0].employeeId;
                Meteor.defer(() => {
                    Meteor.call('livechat:assignToMatrixAgent', custinfo.leadid, employeeid, (err, result) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                });
            }
            return room;
        }
    },
    /* Guest Pool Queuing Method:
     *
     * An incomming livechat is created as an Inquiry
     * which is picked up from an agent.
     * An Inquiry is visible to all agents (TODO: in the correct department)
     *
     * A room is still created with the initial message, but it is occupied by
     * only the client until paired with an agent
     */
    'Guest_Pool': function(guest, message, roomInfo, custinfo) {
        var childleadid;
        if (custinfo && custinfo.chatleadid) {
            childleadid = custinfo.chatleadid;
        } else {
            childleadid = custinfo.leadid;
        }
        let agents = RocketChat.Livechat.getAgents(custinfo.departmentid);
        var date = new Date();
        if (agents.count() === 0 && RocketChat.settings.get('Livechat_guest_pool_with_no_agents')) {
            agents = RocketChat.Livechat.getAgents(custinfo.departmentid);
        }
        var Departmentinfo = RocketChat.models.LivechatDepartment.findOneById(custinfo.departmentid, options);
        var departmentname = Departmentinfo.name;
        var IsService = departmentname.match("_Service");
        if (agents.count() === 0) {
            throw new Meteor.Error('no-agent-online', 'Sorry, no online agents');
        } else {
            if (IsService) {
                var response = 'Service chat';
            } else {
                var url = RocketChat.settings.get('MRSAPI') + "/CustomerInteraction/SetCustInteraction";
                StartDate = (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString() + ' ' + date.getHours().toString() + ':' + date.getMinutes().toString() + ':' + date.getSeconds().toString();
                HTTP.call("POST", url, {
                        data: { "item": { "Data": { "LeadId": childleadid, "CustId": custinfo.custid, "StartDate": StartDate, "IntractionType": "1" } } },
                        headers: { "Authorization": "cG9saWN5 YmF6YWFy" }
                    },
                    function(error, result) {
                        if (!error) {}
                    });
            }
        }
        let options = {
            sort: { _id: 1 }
        };
        const roomCode = RocketChat.models.Rooms.getNextLivechatRoomCode();

        const agentIds = [];

        agents.forEach((agent) => {
            if (custinfo.departmentid) {
                agentIds.push(agent.agentId);
            } else {
                agentIds.push(agent._id);
            }
        });

        var inquiry = {
            rid: message.rid,
            message: message.msg,
            name: custinfo.name,
            ts: new Date(),
            code: roomCode,
            department: custinfo.departmentid,
            agents: agentIds,
            status: 'open',
            t: 'l',
            leadid: custinfo.leadid,
            custid: custinfo.custid
        };
        const room = _.extend({
            _id: message.rid,
            msgs: 1,
            lm: new Date(),
            code: roomCode,
            label: custinfo.name,
            usernames: [guest.username],
            t: 'l',
            ts: new Date(),
            v: {
                _id: guest._id,
                token: message.token
            },
            cl: false,
            open: true,
            waitingResponse: true,
            leadid: custinfo.leadid,
            custid: custinfo.custid,
            department: custinfo.departmentid,
            departmentname: departmentname,
            chatleadid: childleadid
        }, roomInfo);
        if (custinfo.waflag == 1) {
            room.waflag = 1;
        }
        if (custinfo.source && custinfo.source != '') {
            room.source = custinfo.source;
        }
        RocketChat.models.LivechatInquiry.insert(inquiry);
        RocketChat.models.Rooms.insert(room);

        return room;
    }
};