Meteor.setInterval(function() {
    var servername = Meteor.absoluteUrl()
    var departments = RocketChat.models.LivechatDepartment.find();
    departments.forEach((department) => {
        if (RocketChat.settings.get('Livechat_CloseRoomByAdmin_' + department.name + "_" + servername)) {
            var roomcloseTime = null;
            var closingtime = RocketChat.settings.get('Livechat_CloseRoomByAdmin_' + department.name + "_" + servername);
            Meteor.call('livechat:isLogoutTime', closingtime, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    roomcloseTime = result;
                }
            });
            if (roomcloseTime) {
                console.log('Close room cron run for ' + department.name + "_" + servername);
                var lastday = new Date();
                lastday.setHours(01);
                lastday.setDate(lastday.getDate() - 2);
                const rooms = RocketChat.models.Rooms.findiOpenRoomForToday(department.name, lastday).fetch();
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
        }
    });
}, 60000);