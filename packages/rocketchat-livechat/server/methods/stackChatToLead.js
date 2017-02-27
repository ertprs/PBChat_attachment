//new method added by PBChat
Meteor.methods({
    'livechat:stackChatToLead' (rid, newleadid, previousleadid, departmentname) {
        this.unblock();
        var department = RocketChat.models.LivechatDepartment.findOneByName(departmentname);
        RocketChat.models.Rooms.changeLeadidtByRoomId(rid, newleadid, previousleadid, department._id, departmentname);
    }
});