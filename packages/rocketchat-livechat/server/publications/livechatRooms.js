Meteor.publish('livechat:rooms', function(filter = {}, offset = 0, limit = 20, departmentid = null) {
    if (!this.userId) {
        return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:rooms' }));
    }

    if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {
        return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:rooms' }));
    }
    //Changes by PBChat
    check(filter, {
        name: Match.Maybe(String), // room name to filter
        leadid: Match.Maybe(String), // leadid name to filter//Changes by PBChat
        agent: Match.Maybe(String), // agent _id who is serving
        status: Match.Maybe(String), // either 'opened' or 'closed'
        From: Match.Maybe(String),
        To: Match.Maybe(String),
        department: Match.Maybe(String),
        waitingResponse: Match.Maybe(String)
    });

    let query = {};
    if (filter.name) {
        query.label = new RegExp(filter.name, 'i');
    }
    //Changes by PBChat
    if (filter.leadid) {
        query['leadid'] = Number(filter.leadid);
    }
    if (filter.agent) {
        query['servedBy._id'] = filter.agent;
    }
    if (filter.status) {
        if (filter.status === 'opened') {
            query.open = true;
        } else {
            query.open = { $exists: false };
        }
    }

    if (filter.name || filter.leadid) {
        var notimefilter = true;
    } else if (filter.From && filter.To) {
        var StartDate = new Date(filter.From);
        var EndDate = new Date(filter.To);
        query["ts"] = { $gte: StartDate, $lte: EndDate };
    } else if (filter.From) {
        var StartDate = new Date(filter.From);
        query["ts"] = { $gte: StartDate };
    }
    if (filter.department) {
        query["department"] = filter.department;
    } else if (departmentid) {
        query["department"] = departmentid;
    }
    if (filter.waitingResponse == "true") {
        query["waitingResponse"] = true;
    } else if (filter.waitingResponse == "false") {
        query["waitingResponse"] = null;
    }
    return RocketChat.models.Rooms.findLivechat(query, offset, limit);
});