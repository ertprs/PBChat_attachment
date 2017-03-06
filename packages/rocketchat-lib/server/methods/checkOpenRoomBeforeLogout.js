Meteor.methods({
    checkOpenRoomBeforeLogout(agentid, departmentname) {
        var checkopenroom = RocketChat.settings.get('Livechat_CheckOpenRoom_Department');
        if (checkopenroom.trim()) {
            var departmentsNotTocheck = checkopenroom.split(/\s*,\s*/);
            var excludedDepartment = departmentsNotTocheck.indexOf(departmentname) > -1;
            if (!excludedDepartment) {
                var openroom = RocketChat.models.Rooms.findByServerByAndOpen(agentid).count();
                if (openroom && openroom > 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            var openroom = RocketChat.models.Rooms.findByServerByAndOpen(agentid).count();
            if (openroom && openroom > 0) {
                return true;
            } else {
                return false;
            }
        }
    }
});