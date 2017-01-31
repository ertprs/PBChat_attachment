Meteor.setInterval(function() {
    var servername = process.env.INSTANCE_IP;
    console.log(servername);
    var port = process.env.PORT;
    console.log(port);
    var departments = RocketChat.models.LivechatDepartment.find();
    departments.forEach((department) => {
        var key = RocketChat.settings.get('Livechat_CloseChatRealTime_' + department.name + "_" + servername + '_' + port);
        console.log(key);
        if (key) {
            console.log('Close room realtime cron run for ' + department.name + "_" + servername);
            var starttime = new Date();
            starttime.setMinutes(starttime.getMinutes() - 40);
            var endtime = new Date();
            endtime.setMinutes(endtime.getMinutes() - 20);
            const rooms = RocketChat.models.Rooms.findOpenBetweeninterval(department.name, starttime, endtime).fetch();
            console.log(rooms);
            var comment = 'Closed_by_Admin';
            var username = 'admin';
            var user = RocketChat.models.Users.findOneByUsername(username);
            rooms.forEach((room) => {
                if (room && room.servedBy && room.servedBy._id) {
                    RocketChat.Livechat.closeRoom({
                        user: user,
                        room: room,
                        comment: comment
                    });
                }
            });
        }
    });
}, 900000);