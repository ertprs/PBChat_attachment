// Every minute check if office closed
// Meteor.setInterval(function() {
// 	if (RocketChat.settings.get('Livechat_Agent_LogoutTime_NewCar')) {
// 		if (RocketChat.models.LivechatOfficeHour.isOpeningTime()) {
// 			RocketChat.models.Users.openOffice();
// 		} else if (RocketChat.models.LivechatOfficeHour.isClosingTime()) {
// 			RocketChat.models.Users.closeOffice();
// 		}
// 	}
// 	if (RocketChat.settings.get('Livechat_Agent_LogoutTime_TermLife')) {
// 		if (RocketChat.models.LivechatOfficeHour.isOpeningTime()) {
// 			RocketChat.models.Users.openOffice();
// 		} else if (RocketChat.models.LivechatOfficeHour.isClosingTime()) {
// 			RocketChat.models.Users.closeOffice();
// 		}
// 	}
// 	if (RocketChat.settings.get('Livechat_Agent_LogoutTime_Health')) {
// 		if (RocketChat.models.LivechatOfficeHour.isOpeningTime()) {
// 			RocketChat.models.Users.openOffice();
// 		} else if (RocketChat.models.LivechatOfficeHour.isClosingTime()) {
// 			RocketChat.models.Users.closeOffice();
// 		}
// 	}
// 	if (RocketChat.settings.get('Livechat_Agent_LogoutTime_Investments')) {
// 		if (RocketChat.models.LivechatOfficeHour.isOpeningTime()) {
// 			RocketChat.models.Users.openOffice();
// 		} else if (RocketChat.models.LivechatOfficeHour.isClosingTime()) {
// 			RocketChat.models.Users.closeOffice();
// 		}
// 	}
// }, 900000);