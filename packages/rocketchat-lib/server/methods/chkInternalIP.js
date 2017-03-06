Meteor.methods({
	chkInternalIP(username) {
                // console.log(this.request.connection.remoteAddress);
            var access = RocketChat.settings.get('allowexternal');        
            var departmentsToAssign = access.split(/\s*,\s*/);
            var IsAllAccess=departmentsToAssign.indexOf('*') > -1;
            var IsUserAccess = departmentsToAssign.indexOf(username) > -1;    
            if (IsAllAccess || IsUserAccess) {
                console.log('default access');
                return true;                
            }
            else                
                console.log(username + ' - ' +  this.connection.httpHeaders['x-forwarded-for']);
                var Iplist=this.connection.httpHeaders['x-forwarded-for'].split(",");                                
                var Ip=Iplist[0];
                var url = RocketChat.settings.get('COMMAPI') + "/ChatService.svc/IsInternalIP/" + Ip;
                return HTTP.call("GET", url, { headers: { "accept": "application/json" } }).data;                                                               
    }        
});