/**
 * Livechat Department model
 */
class LivechatDepartmentAgents extends RocketChat.models._Base {
    constructor() {
        super('livechat_department_agents');
    }

    findByDepartmentId(departmentId) {
        return this.find({ departmentId: departmentId });
    }

    findOneByAgentId(agentId) {
        const query = { agentId: agentId };
        return this.findOne(query);
    }

    findAllByAgentId(agentId) {
        const query = { agentId: agentId };
        return this.find(query);
    }

    saveAgent(agent) {
        if (agent && agent.count == 0) {
            return this.upsert({
                agentId: agent.agentId,
                departmentId: agent.departmentId
            }, {
                $set: {
                    username: agent.username,
                    count: parseInt(agent.count),
                    order: parseInt(agent.order),
                    limit: parseInt(agent.limit)
                }
            });
        } else {
            return this.upsert({
                agentId: agent.agentId,
                departmentId: agent.departmentId
            }, {
                $set: {
                    username: agent.username,
                    //count: parseInt(agent.count),
                    order: parseInt(agent.order),
                    limit: parseInt(agent.limit)
                }
            });
        }
    }

    removeByDepartmentIdAndAgentId(departmentId, agentId) {
        this.remove({ departmentId: departmentId, agentId: agentId });
    }

    getNextAgentForDepartment(departmentId) {
        var agents = this.findByDepartmentId(departmentId).fetch();

        if (agents.length === 0) {
            return;
        }

        var onlineUsers = RocketChat.models.Users.findOnlineUserFromList(_.pluck(agents, 'username'));
        var onlineUsernames = _.pluck(onlineUsers.fetch(), 'username');

        var query = {
            departmentId: departmentId,
            username: {
                $in: onlineUsernames
            },
            $where: "this.limit > this.count"
        };
        var sort = {
            count: 1,
            assigned: 1,
            order: 1
        };
        var update = {
            $inc: {
                count: 1,
                assigned: 1
            }
        };

        var collectionObj = this.model.rawCollection();
        var findAndModify = Meteor.wrapAsync(collectionObj.findAndModify, collectionObj);

        var agent = findAndModify(query, sort, update);
        if (agent && agent.value) {
            return {
                agentId: agent.value.agentId,
                username: agent.value.username
            };
        } else {
            // var LivechatManager = RocketChat.models.Users.findLivechatManagerFromList(_.pluck(agents, 'username'));
            // console.log( 'LivechatManager' + LivechatManager.agentId);
            // return {
            // 	agentId: LivechatManager.agentId,
            // 	username: LivechatManager.username
            // };
            return 'Guest_Pool';
        }
    }

    //Added by PBChat
    reduceLivechatCount(departmentid, agentid) {
        var query = {
            departmentId: departmentid,
            agentId: agentid,
            count: { $gt: 0 }
        };

        var update = {
            $inc: {
                count: -1
            }
        };
        this.update(query, update);
    }

    //Added by PBChat
    increaseLivechatCount(departmentid, agentid) {
        var query = {
            departmentId: departmentid,
            agentId: agentid,
        };

        var update = {
            $inc: {
                count: 1
            }
        };
        this.update(query, update);
    }

    getOnlineForDepartment(departmentId) {
        var agents = this.findByDepartmentId(departmentId).fetch();

        if (agents.length === 0) {
            return;
        }

        var onlineUsers = RocketChat.models.Users.findOnlineUserFromList(_.pluck(agents, 'username'));

        var onlineUsernames = _.pluck(onlineUsers.fetch(), 'username');

        var query = {
            departmentId: departmentId,
            username: {
                $in: onlineUsernames
            }
        };

        var depAgents = this.find(query);

        if (depAgents) {
            return depAgents;
        } else {
            return null;
        }
    }

    findUsersInQueue(usersList) {
        let query = {};

        if (!_.isEmpty(usersList)) {
            query.username = {
                $in: usersList
            };
        }

        let options = {
            sort: {
                departmentId: 1,
                count: 1,
                order: 1,
                username: 1
            }
        };

        return this.find(query, options);
    }

    // added by PBChat
    findByAgentId(agentId) {
        return this.find({ agentId: agentId });
    }

    findSameDepartmentAgentsByAgentId(agentId) {
        var departments = this.findByAgentId(agentId).fetch();

        if (departments.length === 0) {
            return;
        }

        var departmentIds = _.pluck(departments, 'departmentId');

        var options = {
            fields: {
                agentId: 1
            }
        };

        var query = {
            departmentId: {
                $in: departmentIds
            }
        };

        return this.find(query, options);
    }

    updateLivechatCountAtDayend(departmentid, agentlist) {
        var query = {
            departmentId: departmentid
        };
        const update = {
            $set: {
                "count": 0,
                "assigned": 0

            }
        };
        this.update(query, update, { multi: true });
    }
}

RocketChat.models.LivechatDepartmentAgents = new LivechatDepartmentAgents();