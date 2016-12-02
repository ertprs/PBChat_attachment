Template.livechatFlex.helpers({
	active(...routes) {
		FlowRouter.watchPathChange();
		if (routes.indexOf(FlowRouter.current().route.name) !== -1) {
			return 'active';
		}
	},

	showLinks(){
		if(localStorage.getItem("IsAdmin") === "true"){
			return true;
		}else{
			return false;
		}
	}
});

Template.livechatFlex.events({
	'mouseenter header'() {
		SideNav.overArrow();
	},

	'mouseleave header'() {
		SideNav.leaveArrow();
	},

	'click header'() {
		SideNav.closeFlex();
	}
});
