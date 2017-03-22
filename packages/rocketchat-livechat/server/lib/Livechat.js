/* globals HTTP */
import UAParser from 'ua-parser-js';

RocketChat.Livechat = {
    historyMonitorType: 'url',

    logger: new Logger('Livechat', {
        sections: {
            webhook: 'Webhook'
        }
    }),

    getNextAgent(department) {
        if (department) {
            return RocketChat.models.LivechatDepartmentAgents.getNextAgentForDepartment(department);
        } else {
            return RocketChat.models.Users.getNextAgent();
        }
    },
    getAgents(department) {
        if (department) {
            return RocketChat.models.LivechatDepartmentAgents.findByDepartmentId(department);
        } else {
            return RocketChat.models.Users.findAgents();
        }
    },
    getOnlineAgents(department) {
        if (department) {
            return RocketChat.models.LivechatDepartmentAgents.getOnlineForDepartment(department);
        } else {
            return RocketChat.models.Users.findOnlineAgents();
        }
    },
    getRoom(guest, message, roomInfo, custinfo) {
        var room = RocketChat.models.Rooms.findOneById(message.rid);
        var newRoom = false;

        if (room && !room.open) {
            message.rid = Random.id();
            room = null;
        }

        if (room == null) {
            if (!guest.department) {
                var departments = RocketChat.models.LivechatDepartment.findEnabledWithAgents();
                if (departments.count() > 0) {
                    guest.department = departments.fetch()[0]._id;
                }
            }
            const routingMethod = RocketChat.settings.get('Livechat_Routing_Method_' + custinfo.departmentname);
            room = RocketChat.QueueMethods[routingMethod](guest, message, roomInfo, custinfo);
            newRoom = true;
        } else {
            room = Meteor.call('canAccessRoom', message.rid, guest._id);
        }
        if (!room) {
            throw new Meteor.Error('cannot-acess-room');
        }

        return { room, newRoom };
    },
    sendMessage({ guest, message, roomInfo, custinfo }) {
        let { room, newRoom } = this.getRoom(guest, message, roomInfo, custinfo);
        if (guest.name) {
            //message.alias = guest.name;
            message.alias = custinfo.name;
        }
        return _.extend(RocketChat.sendMessage(guest, message, room), { newRoom: newRoom });
    },
    registerGuest({ token, name, email, department, phone, loginToken, username, custid, country, mobilenumber, invflag } = {}) {
        check(token, String);
        console.log(' RegisterGuest called for -  ' + custid);
        if (!username) {
            username = RocketChat.models.Users.getNextVisitorUsername();
        }

        let updateUser = {
            $set: {
                profile: {
                    guest: true,
                    token: token
                }
            }
        };

        var existingUser = null;

        var userId;
        if (custid == 0) {
            existingUser = RocketChat.models.Users.findOneGuestByEmailAddress(email);
        } else {
            existingUser = RocketChat.models.Users.findOneByCustID(custid);
        }
        if (existingUser) {
            if (existingUser.type !== 'visitor') {
                throw new Meteor.Error('error-invalid-user', 'This is not a visitor.');
            }
            updateUser.$addToSet = {
                globalRoles: 'livechat-guest'
            };
            updateUser.$set.department = department;
            if (loginToken) {
                updateUser.$set.services = {
                    resume: {
                        loginTokens: [loginToken]
                    }
                };
            }
            if (email && email.trim() !== '' && !existingUser.emails) {
                updateUser.$set.emails = [
                    { address: email }
                ];
            }
            userId = existingUser._id;
        } else {
            updateUser.$set.name = name;
            var userData = {
                username: username,
                globalRoles: ['livechat-guest'],
                department: department,
                type: 'visitor',
                custid: custid,
                country: country,
            };

            if (mobilenumber) {
                userData.mobile = mobilenumber;
            }
            if (this.connection) {
                userData.userAgent = this.connection.httpHeaders['user-agent'];
                userData.ip = this.connection.httpHeaders['x-real-ip'] || this.connection.clientAddress;
                userData.host = this.connection.httpHeaders.host;
            }

            userId = Accounts.insertUserDoc({}, userData);

            if (loginToken) {
                updateUser.$set.services = {
                    resume: {
                        loginTokens: [loginToken]
                    }
                };
            }

            if (email && email.trim() !== '') {
                updateUser.$set.emails = [
                    { address: email }
                ];
            }
        }
        if (invflag && invflag == 1) {
            updateUser.$set.invflag = invflag;
        }

        if (phone) {
            updateUser.$set.phone = [
                { phoneNumber: phone.number }
            ];
        }
        Meteor.users.update(userId, updateUser)
        return userId;
    },

    saveGuest({ _id, name, email, phone }) {
        let updateData = {};

        if (name) {
            updateData.name = name;
        }
        if (email) {
            updateData.email = email;
        }
        if (phone) {
            updateData.phone = phone;
        }
        const ret = RocketChat.models.Users.saveUserById(_id, updateData);

        Meteor.defer(() => {
            RocketChat.callbacks.run('livechat.saveGuest', updateData);
        });

        return ret;
    },


    closeRoom({ user, room, comment }) {
        let now = new Date();
        RocketChat.models.Rooms.closeByRoomId(room._id, {
            user: {
                _id: user._id,
                username: user.username
            },
            closedAt: now,
            chatDuration: (room.lm - room.ts) / 1000
        });

        if (room.servedBy && room.servedBy._id) {
            RocketChat.models.LivechatDepartmentAgents.reduceLivechatCount(room.department, room.servedBy._id);
        }

        const message = {
            t: 'livechat-close',
            msg: comment,
            groupable: false
        };

        RocketChat.sendMessage(user, message, room);

        RocketChat.models.Subscriptions.hideByRoomIdAndUserId(room._id, user._id);


        Meteor.defer(() => {
            RocketChat.callbacks.run('livechat.closeRoom', room);
        });

        var stdate = room.ts;
        var date = new Date();
        var url = RocketChat.settings.get('MRSAPI') + "/CustomerInteraction/SetCustInteraction";
        StartDate = (stdate.getMonth() + 1).toString() + '/' + stdate.getDate().toString() + '/' + stdate.getFullYear().toString() + ' ' + stdate.getHours().toString() + ':' + stdate.getMinutes().toString() + ':' + stdate.getSeconds().toString();
        EndDate = (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString() + ' ' + date.getHours().toString() + ':' + date.getMinutes().toString() + ':' + date.getSeconds().toString();
        HTTP.call("POST", url, {
                data: { "item": { "Data": { "LeadId": room.leadid, "CustId": room.custid, "StartDate": StartDate, "EndDate": EndDate, "IntractionType": "1" } } },
                headers: { "Authorization": "cG9saWN5 YmF6YWFy" }
            },
            function(error, result) {
                if (!error) {}
            });

        return true;
    },

    getInitSettings() {
        let settings = {};

        RocketChat.models.Settings.findNotHiddenPublic([
            'Livechat_title',
            'Livechat_title_color',
            'Livechat_enabled',
            'Livechat_registration_form',
            'Livechat_offline_title',
            'Livechat_offline_title_color',
            'Livechat_offline_message',
            'Livechat_offline_success_message',
            'Livechat_offline_form_unavailable',
            'Livechat_display_offline_form',
            'Livechat_videocall_enabled',
            'Jitsi_Enabled',
            'Language',
            'FileUpload_MediaTypeWhiteList',
            'FileUpload_MaxFileSize',
            'FileUpload_Storage_Type',
            'FileUpload_Livechat_Enabled',
            'Livechat_enable_transcript',
            'Livechat_transcript_message',
        ]).forEach((setting) => {
            settings[setting._id] = setting.value;
        });

        return settings;
    },

    saveRoomInfo(roomData, guestData) {
        if (!RocketChat.models.Rooms.saveRoomById(roomData._id, roomData)) {
            return false;
        }

        Meteor.defer(() => {
            RocketChat.callbacks.run('livechat.saveRoom', roomData);
        });

        if (!_.isEmpty(guestData.name)) {
            return RocketChat.models.Rooms.setLabelByRoomId(roomData._id, guestData.name) && RocketChat.models.Subscriptions.updateNameByRoomId(roomData._id, guestData.name);
        }
    },

    closeOpenChats(userId, comment) {
        const user = RocketChat.models.Users.findOneById(userId);
        RocketChat.models.Rooms.findOpenByAgent(userId).forEach((room) => {
            this.closeRoom({ user, room, comment });
        });
    },

    forwardOpenChats(userId) {
        RocketChat.models.Rooms.findOpenByAgent(userId).forEach((room) => {
            const guest = RocketChat.models.Users.findOneById(room.v._id);
            this.transfer(room, guest, { departmentId: guest.department });
        });
    },

    savePageHistory(token, pageInfo) {
        if (pageInfo.change === RocketChat.Livechat.historyMonitorType) {
            return RocketChat.models.LivechatPageVisited.saveByToken(token, pageInfo);
        }

        return;
    },

    transfer(room, guest, transferData) {
        let agent;
        if (transferData.userId) {
            const user = RocketChat.models.Users.findOneById(transferData.userId);
            agent = {
                agentId: user._id,
                username: user.username
            };
        } else {
            //agent = RocketChat.Livechat.getNextAgent(transferData.departmentId);
            var inquiry = RocketChat.models.LivechatInquiry.getEnquiryByRoomId(room._id);
            var agents = RocketChat.Livechat.getAgents(transferData.deparmentId);
            var agentIds = [];
            agents.forEach((agent) => {
                agentIds.push(agent.agentId)
            });
            if (inquiry) {
                RocketChat.models.LivechatInquiry.openInquiryAndUpadteAgents(inquiry._id, agentIds);
            } else {
                var inquiry = {
                    rid: room._id,
                    message: 'Transferred Chat',
                    name: room.label,
                    ts: new Date(),
                    code: room.code,
                    department: transferData.deparmentId,
                    agents: agentIds,
                    status: 'open',
                    t: 'l',
                    leadid: room.leadid,
                    custid: room.custid
                };
                RocketChat.models.LivechatInquiry.insert(inquiry);
            }
            if (room.servedBy) {
                room.usernames = _.without(room.usernames, room.servedBy.username);
            }
            if (room.servedBy) {
                var transferredDepartment = RocketChat.models.LivechatDepartment.findOneById(transferData.deparmentId);
                RocketChat.models.Subscriptions.removeByRoomIdAndUserId(room._id, room.servedBy._id);
                RocketChat.models.LivechatDepartmentAgents.reduceLivechatCount(room.department, room.servedBy._id);
                RocketChat.models.Messages.createUserLeaveWithRoomIdAndUser(room._id, { _id: room.servedBy._id, username: room.servedBy.username });
                RocketChat.models.Rooms.markRoomAsTransfered(room._id, transferredDepartment._id, transferredDepartment.name);
            }
            RocketChat.models.Rooms.removeAgentFromRoom(room._id, room.usernames);
            return true;
        }

        if (agent) {
            if (room.servedBy) {
                room.usernames = _.without(room.usernames, room.servedBy.username).concat(agent.username);
            } else {
                room.usernames = _.without(room.usernames).concat(agent.username);
            }

            let subscriptionData = {
                rid: room._id,
                name: guest.name || guest.username,
                alert: true,
                open: true,
                unread: 1,
                code: room.code,
                u: {
                    _id: agent.agentId,
                    username: agent.username
                },
                t: 'l',
                desktopNotifications: 'all',
                mobilePushNotifications: 'all',
                emailNotifications: 'all'
            };
            if (room.servedBy) {
                RocketChat.models.Subscriptions.removeByRoomIdAndUserId(room._id, room.servedBy._id);
            }
            var transferredDepartment = Meteor.call('getuserdepartment', agent.agentId);
            RocketChat.models.Subscriptions.insert(subscriptionData);

            RocketChat.models.Rooms.changeAgentByRoomId(room._id, room.usernames, agent);
            RocketChat.models.Rooms.markRoomAsTransfered(room._id, transferredDepartment._id, transferredDepartment.name);

            if (room.servedBy) {
                RocketChat.models.LivechatDepartmentAgents.reduceLivechatCount(room.department, room.servedBy._id);
                RocketChat.models.Messages.createUserLeaveWithRoomIdAndUser(room._id, { _id: room.servedBy._id, username: room.servedBy.username });
            }

            RocketChat.models.Messages.createUserJoinWithRoomIdAndUser(room._id, { _id: agent.agentId, username: agent.username });

            if (room.servedBy) {
                RocketChat.models.LivechatDepartmentAgents.increaseLivechatCount(room.department, agent.agentId);
            }
            if (!room.servedBy) {
                RocketChat.models.LivechatInquiry.takeInquiryByRid(room._id);
            }
            return true;
        }

        return false;
    },

    sendRequest(postData, callback, trying = 1) {
        try {
            let options = {
                headers: {
                    'X-RocketChat-Livechat-Token': RocketChat.settings.get('Livechat_secret_token')
                },
                data: postData
            };
            return HTTP.post(RocketChat.settings.get('Livechat_webhookUrl'), options);
        } catch (e) {
            RocketChat.Livechat.logger.webhook.error('Response error on ' + trying + ' try ->', e);
            // try 10 times after 10 seconds each
            if (trying < 10) {
                RocketChat.Livechat.logger.webhook.warn('Will try again in 10 seconds ...');
                trying++;
                setTimeout(Meteor.bindEnvironment(() => {
                    RocketChat.Livechat.sendRequest(postData, callback, trying);
                }), 10000);
            }
        }
    },

    getLivechatRoomGuestInfo(room) {
        const visitor = RocketChat.models.Users.findOneById(room.v._id);
        const agent = RocketChat.models.Users.findOneById(room.servedBy._id);

        const ua = new UAParser();
        ua.setUA(visitor.userAgent);

        let postData = {
            _id: room._id,
            label: room.label,
            topic: room.topic,
            code: room.code,
            createdAt: room.ts,
            lastMessageAt: room.lm,
            tags: room.tags,
            customFields: room.livechatData,
            visitor: {
                _id: visitor._id,
                name: visitor.name,
                username: visitor.username,
                email: null,
                phone: null,
                department: visitor.department,
                ip: visitor.ip,
                os: ua.getOS().name && (ua.getOS().name + ' ' + ua.getOS().version),
                browser: ua.getBrowser().name && (ua.getBrowser().name + ' ' + ua.getBrowser().version),
                customFields: visitor.livechatData
            },
            agent: {
                _id: agent._id,
                username: agent.username,
                name: agent.name,
                email: null
            }
        };

        if (room.crmData) {
            postData.crmData = room.crmData;
        }

        if (visitor.emails && visitor.emails.length > 0) {
            postData.visitor.email = visitor.emails[0].address;
        }
        if (visitor.phone && visitor.phone.length > 0) {
            postData.visitor.phone = visitor.phone[0].phoneNumber;
        }

        if (agent.emails && agent.emails.length > 0) {
            postData.agent.email = agent.emails[0].address;
        }

        return postData;
    },

    addAgent(username) {
        check(username, String);

        const user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1, username: 1 } });

        if (!user) {
            throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:addAgent' });
        }

        if (RocketChat.authz.addUserRoles(user._id, 'livechat-agent')) {
            RocketChat.models.Users.setOperator(user._id, true);
            RocketChat.models.Users.setLivechatStatus(user._id, 'available');
            return user;
        }

        return false;
    },

    addManager(username) {
        check(username, String);

        const user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1, username: 1 } });

        if (!user) {
            throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:addManager' });
        }

        if (RocketChat.authz.addUserRoles(user._id, 'livechat-manager')) {
            return user;
        }

        return false;
    },

    removeAgent(username) {
        check(username, String);

        const user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1 } });

        if (!user) {
            throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:removeAgent' });
        }

        if (RocketChat.authz.removeUserFromRoles(user._id, 'livechat-agent')) {
            RocketChat.models.Users.setOperator(user._id, false);
            RocketChat.models.Users.setLivechatStatus(user._id, 'not-available');
            return true;
        }

        return false;
    },

    removeManager(username) {
        check(username, String);

        const user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1 } });

        if (!user) {
            throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:removeManager' });
        }

        return RocketChat.authz.removeUserFromRoles(user._id, 'livechat-manager');
    },

    saveDepartment(_id, departmentData, departmentAgents) {
        check(_id, Match.Maybe(String));

        check(departmentData, {
            enabled: Boolean,
            name: String,
            description: Match.Optional(String)
        });
        if (_id) {
            const department = RocketChat.models.LivechatDepartment.findOneById(_id);
            if (!department) {
                throw new Meteor.Error('error-department-not-found', 'Department not found', { method: 'livechat:saveDepartment' });
            }
        }
        return RocketChat.models.LivechatDepartment.createOrUpdateDepartment(_id, departmentData.enabled, departmentData.name, departmentData.description, departmentAgents);
    },

    removeDepartment(_id) {
        check(_id, String);

        var department = RocketChat.models.LivechatDepartment.findOneById(_id, { fields: { _id: 1 } });

        if (!department) {
            throw new Meteor.Error('department-not-found', 'Department not found', { method: 'livechat:removeDepartment' });
        }

        return RocketChat.models.LivechatDepartment.removeById(_id);
    },

    updateBlockCustomer(_id, Isblock) {
        if (_id) {
            return RocketChat.models.Users.updateBlockCustomer(_id, Isblock);
        }
    }
};

RocketChat.settings.get('Livechat_history_monitor_type', (key, value) => {
    RocketChat.Livechat.historyMonitorType = value;
});