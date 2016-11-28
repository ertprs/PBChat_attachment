RocketChat.QueueMethods = {
	/* Least Amount Queuing method:
	 *
	 * default method where the agent with the least number
	 * of open chats is paired with the incoming livechat
	 */
	'Least_Amount' : function(guest, message, roomInfo,custinfo) {	//custinfo added by PBChat
		const agent = RocketChat.Livechat.getNextAgent(guest.department);
		var date = new Date();
		if (!agent) {
			throw new Meteor.Error('no-agent-online', 'Sorry, no online agents');
		}
		//Added By PBChat
		else
        {                       
            var url=RocketChat.settings.get('MRSAPI') + "/CustomerInteraction/SetCustInteraction";
            StartDate = (date.getMonth()+1).toString() + '/' + date.getDate().toString()+ '/' + date.getFullYear().toString()+' '+ date.getHours().toString() + ':' + date.getMinutes().toString() + ':' + date.getSeconds().toString();    
            HTTP.call("POST", url,
            {data: {"item":{"Data":{"LeadId":custinfo.leadid,"CustId":custinfo.custid,"StartDate":StartDate,"IntractionType":"1"}}}
                            ,headers:{"Authorization":"cG9saWN5 YmF6YWFy"}},                    
            function (error, result) {
                if (!error) {
                }
            });         
        }
		let options = {
			sort: { _id : 1}
		};

        var Departmentinfo = RocketChat.models.LivechatDepartment.findOneById(guest.department, options);
		var departmentname = Departmentinfo.name;
		//Added By PBChat

		const roomCode = RocketChat.models.Rooms.getNextLivechatRoomCode();

		const room = _.extend({
			_id: message.rid,
			msgs: 1,
			lm: new Date(),
			code: roomCode,
			label: guest.name || guest.username,
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
			//Added By PBChat         
            leadid: custinfo.leadid,
            custid: custinfo.custid,
			department: guest.department,
			departmentname: departmentname,
			//Added By PBChat 	
		}, roomInfo);
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

		return room;
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
	'Guest_Pool' : function(guest, message, roomInfo, custinfo) {
		//let agents = RocketChat.Livechat.getOnlineAgents(guest.department);
		let agents = RocketChat.Livechat.getAgents(guest.department);
		var date = new Date();
		if (agents.count() === 0 && RocketChat.settings.get('Livechat_guest_pool_with_no_agents')) {
			agents = RocketChat.Livechat.getAgents(guest.department);
		}

		if (agents.count() === 0) {
			throw new Meteor.Error('no-agent-online', 'Sorry, no online agents');
		}
		else
        {                       
            var url=RocketChat.settings.get('MRSAPI') + "/CustomerInteraction/SetCustInteraction";
            StartDate = (date.getMonth()+1).toString() + '/' + date.getDate().toString()+ '/' + date.getFullYear().toString()+' '+ date.getHours().toString() + ':' + date.getMinutes().toString() + ':' + date.getSeconds().toString();    
            HTTP.call("POST", url,
            {data: {"item":{"Data":{"LeadId":custinfo.leadid,"CustId":custinfo.custid,"StartDate":StartDate,"IntractionType":"1"}}}
                            ,headers:{"Authorization":"cG9saWN5 YmF6YWFy"}},                    
            function (error, result) {
                if (!error) {
                }
            });         
        }
		let options = {
			sort: { _id : 1}
		};
        var Departmentinfo = RocketChat.models.LivechatDepartment.findOneById(guest.department, options);
		var departmentname = Departmentinfo.name;
		//Added By PBChat
		const roomCode = RocketChat.models.Rooms.getNextLivechatRoomCode();

		const agentIds = [];

		agents.forEach((agent) => {
			if (guest.department) {
				agentIds.push(agent.agentId);
			} else {
				agentIds.push(agent._id);
			}
		});

		var inquiry = {
			rid: message.rid,
			message: message.msg,
			name: guest.name || guest.username,
			ts: new Date(),
			code: roomCode,
			department: guest.department,
			agents: agentIds,
			status: 'open',
			t: 'l',
			//Added By PBChat         
            leadid: custinfo.leadid,
            custid: custinfo.custid
			//Added By PBChat
		};
		const room = _.extend({
			_id: message.rid,
			msgs: 1,
			lm: new Date(),
			code: roomCode,
			label: guest.name || guest.username,
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
			//Added By PBChat         
            leadid: custinfo.leadid,
            custid: custinfo.custid,
			department: guest.department,
			departmentname: departmentname,
			//Added By PBChat 	
		}, roomInfo);
		RocketChat.models.LivechatInquiry.insert(inquiry);
		RocketChat.models.Rooms.insert(room);

		return room;
	}
};
