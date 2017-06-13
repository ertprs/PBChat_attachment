Meteor.setInterval(function() {
    var servername = process.env.INSTANCE_IP;
    var port = process.env.PORT;
    console.log(servername + ' ' + port);
    var departments = RocketChat.models.LivechatDepartment.find();
    departments.forEach((department) => {
        var key = RocketChat.settings.get('Livechat_CloseChatRealTime_' + department.name + "_" + servername + '_' + port);
        if (key) {
            console.log('Close room realtime cron run for ' + department.name + "_" + servername + '_' + port);
            var starttime = new Date();
            var closeChatStartTime = RocketChat.settings.get('Livechat_CloseChatStartTime_' + department.name);
            starttime.setMinutes(starttime.getMinutes() - closeChatStartTime);
            var endtime = new Date();
            var closeChatEndTime = RocketChat.settings.get('Livechat_CloseChatEndTime_' + department.name);
            endtime.setMinutes(endtime.getMinutes() - closeChatEndTime);
            const rooms = RocketChat.models.Rooms.findOpenBetweeninterval(department.name, starttime, endtime).fetch();
            console.log(rooms);
            var comment = 'Closed_by_Admin';
            var username = 'admin';
            var user = RocketChat.models.Users.findOneByUsername(username);
            rooms.forEach((room) => {
                if (room && room.servedBy && room.servedBy._id && room.cb != 1) {
                    const agentDepartment = RocketChat.models.LivechatDepartmentAgents.findOneByAgentId(room.servedBy._id);
                    if (department && department._id && agentDepartment && agentDepartment.departmentId && department._id == agentDepartment.departmentId) {
                        RocketChat.Livechat.closeRoom({
                            user: user,
                            room: room,
                            comment: comment
                        });
                    }
                }
            });
        }
    });
}, 900000);