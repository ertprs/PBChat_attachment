Meteor.methods({
    'livechat:getInitialData' (visitorToken, leadid, service) {
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
            custinfo: {
                name: null,
                email: null,
                custid: null,
                leadid: null,
                departmentid: null,
                departmentname: null,
                subproduct: null,
                country: null
            }
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
        if (service == 0) {
            var leaddata;
            Meteor.call('livechat:getDetailsForService', leadid, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    leaddata = result;
                }
            });
            // var url = RocketChat.settings.get('COMMAPI') + "/ChatService.svc/getCustInfo/" + leadid;
            // var leaddata = HTTP.call("GET", url, { headers: { "accept": "application/json" } }).data;
            info.custinfo.name = leaddata.CustomerName;
            info.custinfo.email = leaddata.EmailId;
            info.custinfo.custid = leaddata.CustID;
            info.custinfo.leadid = leaddata.LeadID;
            info.custinfo.departmentid = leaddata.ChatDepartmentID;
            info.custinfo.departmentname = leaddata.ProductName;
            if (info.custinfo.departmentname == 'Investments') {
                info.custinfo.subproduct = leaddata.InvestmentType;
            }
            info.custinfo.country = leaddata.Country;
            if (info.custinfo.departmentname == 'Investments' && (info.custinfo.subproduct == 'CHILD' || info.custinfo.subproduct == 'GROWTH' || info.custinfo.subproduct == 'RETIREMENT')) {
                info.welcome = RocketChat.settings.get('Livechat_WelcomeMessage_' + info.custinfo.departmentname + '_' + info.custinfo.subproduct);
            } else {
                info.welcome = RocketChat.settings.get('Livechat_WelcomeMessage_' + info.custinfo.departmentname);
            }
            var r = 'Livechat_offline_message_' + info.custinfo.departmentname;
            info.offlineMessage = RocketChat.settings.get(r);
            if (info.custinfo.departmentid) {
                var departmentagents = RocketChat.models.LivechatDepartmentAgents.getOnlineForDepartment(info.custinfo.departmentid);
                if (departmentagents) {
                    info.online = departmentagents.count() > 0;
                } else {
                    info.online = false;
                }
            } else {
                var agents = RocketChat.models.Users.findOnlineAgents();
                if (agents) {
                    info.online = agents.count() > 0;
                } else {
                    info.online = false;
                }
            }
            var openingtime = RocketChat.settings.get('Livechat_Widget_OpeningTiming_' + info.custinfo.departmentname);
            var closingtime = RocketChat.settings.get('Livechat_Widget_ClosingTiming_' + info.custinfo.departmentname);
        } else {
            info.welcome = RocketChat.settings.get('Livechat_WelcomeMessage');
            var r = 'Livechat_offline_message';
            info.offlineMessage = RocketChat.settings.get(r);
            var openingtime = RocketChat.settings.get('Livechat_Widget_OpeningTiming_Service');
            var closingtime = RocketChat.settings.get('Livechat_Widget_ClosingTiming_Service');
        }

        const initSettings = RocketChat.Livechat.getInitSettings();
        info.title = initSettings.Livechat_title;
        info.color = initSettings.Livechat_title_color;
        info.enabled = initSettings.Livechat_enabled;
        info.registrationForm = initSettings.Livechat_registration_form;
        info.offlineTitle = initSettings.Livechat_offline_title;
        info.offlineColor = initSettings.Livechat_offline_title_color;
        info.offlineSuccessMessage = initSettings.Livechat_offline_success_message;
        info.offlineUnavailableMessage = initSettings.Livechat_offline_form_unavailable;
        info.displayOfflineForm = initSettings.Livechat_display_offline_form;
        info.language = initSettings.Language;
        info.videoCall = initSettings.Livechat_videocall_enabled === true && initSettings.Jitsi_Enabled === true;
        info.transcript = initSettings.Livechat_enable_transcript;
        info.transcriptMessage = initSettings.Livechat_transcript_message;
        info.allowAttachments = initSettings.FileUpload_Livechat_Enabled; // need to set as setting
        info.storageType = initSettings.FileUpload_Storage_Type;
        info.maxFileSize = initSettings.FileUpload_MaxFileSize;
        info.mediaTypeWhiteList = initSettings.FileUpload_MediaTypeWhiteList;
        RocketChat.models.LivechatTrigger.find().forEach((trigger) => {
            info.triggers.push(trigger);
        });

        RocketChat.models.LivechatDepartment.findEnabledWithAgents().forEach((department) => {
            info.departments.push(department);
        });
        if (openingtime && closingtime && info.online) {
            var currentTime = moment.utc(moment().utc().format('HH:mm'), 'HH:mm');
            var start = moment.utc(openingtime, 'HH:mm');
            var finish = moment.utc(closingtime, 'HH:mm');
            if (finish.isBefore(start)) {
                finish.add(1, 'days');
            }
            var widgetstatus = currentTime.isBetween(start, finish);
            if (!widgetstatus) {
                info.online = currentTime.isBetween(start, finish);
            }
        }
        return info;
    }
});