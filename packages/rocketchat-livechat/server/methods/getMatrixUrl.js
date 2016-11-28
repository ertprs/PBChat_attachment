//new method added by PBChat
Meteor.methods({
	'livechat:getMatrixUrl'(rid) {
		const room = RocketChat.models.Rooms.findOneById(rid);
		var showSalesView = RocketChat.settings.get('showSalesView');
		if(showSalesView){
			var url=RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getMatrixURL/" + room.leadid +"/" + room.custid +"/" + Meteor.userId();
			return HTTP.call("GET",url,{headers:{"accept": "application/json"}}).data;
		}
		else{
			return 'false';
		}	
	}
});
