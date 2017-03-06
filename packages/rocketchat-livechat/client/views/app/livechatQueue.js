/* globals LivechatQueueUser */

Template.livechatQueue.helpers({
    departments() {
        return LivechatDepartment.find({
            enabled: true,
            _id: localStorage.getItem('DepartmentId')
        }, {
            sort: {
                name: 1
            }
        });
    },

    users() {
        let users = [];

        let showOffline = Template.instance().showOffline.get();
        LivechatQueueUser.find({
            departmentId: this._id
        }, {
            sort: {
                count: 1,
                order: 1,
                username: 1
            }
        }).forEach((user) => {
            let options = { fields: { _id: 1 } };
            let userFilter = { _id: user.agentId, status: { $ne: 'offline' } };
            let agentFilter = { _id: user.agentId, statusLivechat: 'available' };

            if (showOffline[this._id] || (Meteor.users.findOne(userFilter, options) && AgentUsers.findOne(agentFilter, options))) {
                users.push(user);
            }
        });
        return users;
    },
    isOffline() {
        if (Meteor.users.findOne({ _id: this.agentId, status: 'online' })) {
            return false;
        } else {
            return true;
        }
    },
    availability() {
        if (Meteor.users.findOne({ _id: this.agentId, status: 'online' })) {
            return 'Online';
        } else {
            return 'Offline';
        }
    },
    hasPermission() {
        const user = RocketChat.models.Users.findOne(Meteor.userId(), { fields: { statusLivechat: 1 } });
        return RocketChat.authz.hasRole(Meteor.userId(), 'livechat-manager') || (user.statusLivechat === 'available' && RocketChat.settings.get('Livechat_show_queue_list_link'));
    },

    assignedchat() {
        return ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId }).count();
    },

    waitingResponsing() {
        return ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId, waitingResponse: true }).count();
    },

    responded() {
        return ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId, responseTime: { $ne: null } }).count();
    },

    AgentresponseTime() {
        var responcedChat = ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId, waitingResponse: { $ne: true } }).fetch();
        var responsetime = 0.0;
        var avgResposeTime = 0.0;
        if (responcedChat.length != 0) {
            for (i = 0; i < responcedChat.length; i++) {
                if (responcedChat[i].responseTime) {
                    responsetime = responsetime + responcedChat[i].responseTime;
                }
            };
            avgResposeTime = responsetime / responcedChat.length;
        }
        return Math.round(avgResposeTime);
    },
    totalChatCount() {
        return ChatRoom.find({ t: 'l' }).count();
    },

    totalOpenChatCount() {
        return ChatRoom.find({ t: 'l', open: true }).count();
    },

    totalresponsewaiting() {
        return ChatRoom.find({ t: 'l', waitingResponse: true }).count();
    },
    totalrespondedChat() {
        return ChatRoom.find({ t: 'l', waitingResponse: { $ne: true } }).count();
    },
    AvgResponseTime() {
        var responcedChat = ChatRoom.find({ t: 'l', waitingResponse: { $ne: true } }).fetch();
        var responsetime = 0.0;
        var avgResposeTime = 0.0;
        if (responcedChat.length != 0) {
            for (i = 0; i < responcedChat.length; i++) {
                if (responcedChat[i].responseTime) {
                    responsetime = responsetime + responcedChat[i].responseTime;
                }
            };
            avgResposeTime = responsetime / responcedChat.length;
        }
        return Math.round(avgResposeTime);
    }
});

Template.livechatQueue.events({
    'click .show-offline' (event, instance) {
        let showOffline = instance.showOffline.get();

        showOffline[this._id] = event.currentTarget.checked;

        instance.showOffline.set(showOffline);
    }
});

Template.livechatQueue.onCreated(function() {
    this.showOffline = new ReactiveVar({});
    this.filter = new ReactiveVar({});
    // this.agentdata = new ReactiveVar({});
    var Today = new Date();
    var StartDate = Today.getFullYear().toString() + '-' + (Today.getMonth() + 1).toString() + '-' + Today.getDate().toString();
    var nextday = new Date();
    var numberOfDaysToAdd = 1;
    nextday.setDate(nextday.getDate() + numberOfDaysToAdd);
    var EndDate = nextday.getFullYear().toString() + '-' + (nextday.getMonth() + 1).toString() + '-' + nextday.getDate().toString();
    let filter1 = {};
    filter1['From'] = StartDate;
    filter1['To'] = EndDate;
    filter1['department'] = localStorage.getItem('DepartmentId');
    this.filter.set(filter1);
    this.subscribe('livechat:queue');
    this.subscribe('livechat:agents');
    this.subscribe('livechat:departments');
    this.autorun(() => {
        this.subscribe('livechat:rooms', this.filter.get(), 0, 5000);
    });
});