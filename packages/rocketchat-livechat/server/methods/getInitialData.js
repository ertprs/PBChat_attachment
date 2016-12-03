Meteor.methods({
	'livechat:getInitialData'(visitorToken,leadid) {
		var info = {
			enabled: null,
			title: null,
			color: null,
			registrationForm: null,
			room: null,
			triggers: [],
			departments: [],
			online: true,
			offlineColor: null,
			offlineMessage: null,
			offlineSuccessMessage: null,
			offlineUnavailableMessage: null,
			displayOfflineForm: null,
			videoCall: null,
			//Added by PBChat
			custinfo: {
                    name: null,
                    email: null,
                    custid: null,
                    leadid: null,
                    departmentid: null 
                }
			//Added by PBChat
		};

		const room = RocketChat.models.Rooms.findOpenByVisitorToken(visitorToken, {
			fields: {
				name: 1,
				t: 1,
				cl: 1,
				u: 1,
				usernames: 1,
				v: 1
			}
		}).fetch();

		if (room && room.length > 0) {
			info.room = room[0];
		}

		const initSettings = RocketChat.Livechat.getInitSettings();
		//Added by PBChat
		info.welcome = initSettings.Livechat_WelcomeMessage;		
		//Added by PBChat
		info.title = initSettings.Livechat_title;
		info.color = initSettings.Livechat_title_color;
		info.enabled = initSettings.Livechat_enabled;
		info.registrationForm = initSettings.Livechat_registration_form;
		info.offlineTitle = initSettings.Livechat_offline_title;
		info.offlineColor = initSettings.Livechat_offline_title_color;
		info.offlineMessage = initSettings.Livechat_offline_message;
		info.offlineSuccessMessage = initSettings.Livechat_offline_success_message;
		info.offlineUnavailableMessage = initSettings.Livechat_offline_form_unavailable;
		info.displayOfflineForm = initSettings.Livechat_display_offline_form;
		info.language = initSettings.Language;
		info.videoCall = initSettings.Livechat_videocall_enabled === true && initSettings.Jitsi_Enabled === true;
		//Added by PBChat for Livechat Transcript
		info.transcript = initSettings.Livechat_enable_transcript;
		info.transcriptMessage = initSettings.Livechat_transcript_message;
		//Added by PBChat for Livechat Transcript
        // Attachments info
		info.allowAttachments = initSettings.FileUpload_Livechat_Enabled; // need to set as setting
		info.storageType = initSettings.FileUpload_Storage_Type;
		info.maxFileSize = initSettings.FileUpload_MaxFileSize;
		info.mediaTypeWhiteList = initSettings.FileUpload_MediaTypeWhiteList;
		RocketChat.models.LivechatTrigger.find().forEach((trigger) => {
			info.triggers.push(trigger);
		});

		//for custinfo properties PBChat Deepankar
        var url=RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getCustInfo/" + leadid ;
		var leaddata = HTTP.call("GET",url,{headers:{"accept": "application/json"}}).data;
        info.custinfo.name = leaddata.CustomerName;
        info.custinfo.email = leaddata.EmailId;
        info.custinfo.custid = leaddata.CustID;
        info.custinfo.leadid = leaddata.LeadID;
        info.custinfo.departmentid = leaddata.ChatDepartmentID;
		info.custinfo.departmentname = leaddata.ProductName;
        //for custinfo properties

		RocketChat.models.LivechatDepartment.findEnabledWithAgents().forEach((department) => {
			info.departments.push(department);
		});

		//Added by PbChat(Online agent inside a particular department)
        if(info.custinfo.departmentid){
            info.online = RocketChat.models.LivechatDepartmentAgents.getOnlineForDepartment(info.custinfo.departmentid).count() > 0;
        }           
        else{
 
            info.online = RocketChat.models.Users.findOnlineAgents().count() > 0;
        }

        var openingtime = RocketChat.settings.get('Livechat_Widget_OpeningTiming_' + info.custinfo.departmentname);
		
		var closingtime = RocketChat.settings.get('Livechat_Widget_ClosingTiming_' + info.custinfo.departmentname);
		
		if(openingtime && closingtime){
			var currentTime = moment.utc(moment().utc().format('HH:mm'), 'HH:mm');
			var start = moment.utc(openingtime, 'HH:mm');
		    var finish = moment.utc(closingtime, 'HH:mm');
			if (finish.isBefore(start)) {
			     finish.add(1, 'days');
		    }
			info.online = currentTime.isBetween(start, finish);
		}

		return info;
	}
});
