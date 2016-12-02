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

	hasPermission() {
		const user = RocketChat.models.Users.findOne(Meteor.userId(), { fields: { statusLivechat: 1 } });
		return RocketChat.authz.hasRole(Meteor.userId(), 'livechat-manager') || (user.statusLivechat === 'available' && RocketChat.settings.get('Livechat_show_queue_list_link'));
	},

	assignedchat(){
        return ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId}).count();
	},

	responded(){
        return ChatRoom.find({ t: 'l','responseBy._id': this.agentId, responseTime:{$ne:null} }).count();
	},

	AgentresponseTime(){
		var responcedChat = ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId, waitingResponse: {$ne:true}}).count(); 
		var responsetime  = 0.0 ;
		var avgResposeTime  = 0.0 ;
		if(responcedChat != 0){
			for (i = 0; i < responcedChat; i++) { 
				if(ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId, waitingResponse: {$ne:true}}).fetch()[i].responseTime){
					responsetime = responsetime + ChatRoom.find({ t: 'l', 'servedBy._id': this.agentId, waitingResponse: {$ne:true}}).fetch()[i].responseTime;
				}
		};
		avgResposeTime = responsetime/responcedChat;
		}
		return Math.round(avgResposeTime);
	},
	totalChatCount(){
        return ChatRoom.find({ t: 'l'}).count();
	},

	totalOpenChatCount(){
        return ChatRoom.find({ t: 'l',open:true}).count();
	},

	totalrespondedChat(){
        return ChatRoom.find({ t: 'l',responseTime:{$ne:null}}).count();
	},
	AvgResponseTime(){
		var responcedChat = ChatRoom.find({ t: 'l', waitingResponse: {$ne:true}}).count(); 
		var responsetime  = 0.0 ;
		var avgResposeTime  = 0.0 ;
		if(responcedChat != 0){
			for (i = 0; i < responcedChat; i++) { 
				if(ChatRoom.find({ t: 'l', waitingResponse: {$ne:true}}).fetch()[i].responseTime){
					responsetime = responsetime + ChatRoom.find({ t: 'l', waitingResponse: {$ne:true}}).fetch()[i].responseTime;
				}
		};
		avgResposeTime = responsetime/responcedChat;
		}
		return Math.round(avgResposeTime);
	},

	totalChatTime(){
		var chatcount = ChatRoom.find({ t: 'l'}).count();
		var totalChatTime  = 0 ;
		if(chatcount != 0){
			for (i = 0; i < chatcount; i++) { 
				var a = moment(ChatRoom.find().fetch()[i].lm);
				var b = moment(ChatRoom.find().fetch()[i].ts);
				totalChatTime = totalChatTime + a.diff(b, 'seconds');
			}
		}
		var days =  Math.floor(totalChatTime / (3600*24));
		var hours = Math.floor((totalChatTime - days*24*3600) / 3600);
		var minute = Math.floor((totalChatTime - hours*60*60 - days*24*3600) / 60);
		var seconds = Math.floor((totalChatTime - hours*60*60 - minute*60 - days*24*3600) / 60);
		if(days == 0 && hours == 0 && minute ==0){
			return  seconds + ' sec';
		}
		else if(days == 0 && hours == 0){
			return  minute + ' min ' + seconds + ' sec';
		}
		else if(days == 0){
			return  hours + ' hrs ' + minute + ' min ' + seconds + ' sec';
		}
		else{
			return  days + ' days ' + hours + ' hrs ' + minute + ' min ' + seconds + ' sec';
		}
	},
});

Template.livechatQueue.events({
	'click .show-offline'(event, instance) {
		let showOffline = instance.showOffline.get();

		showOffline[this._id] = event.currentTarget.checked;

		instance.showOffline.set(showOffline);
	}
});

Template.livechatQueue.onCreated(function() {
	this.showOffline = new ReactiveVar({});
	this.filter = new ReactiveVar({});
    var Today = new Date();
	var StartDate = Today.getFullYear().toString() + '-' + (Today.getMonth()+1).toString() + '-' + Today.getDate().toString();
	var nextday = new Date();
    var numberOfDaysToAdd = 1;
    nextday.setDate(nextday.getDate() + numberOfDaysToAdd); 
	var EndDate = nextday.getFullYear().toString() + '-' + (nextday.getMonth()+1).toString() + '-' + nextday.getDate().toString();
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



