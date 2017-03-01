import UAParser from 'ua-parser-js';

Template.visitorInfo.helpers({
    user() {
        const user = Template.instance().user.get();
        const cardetails = Template.instance().cardetails.get();
        const healthdetails = Template.instance().healthdetails.get();
        if (user && user.userAgent) {
            var ua = new UAParser();
            ua.setUA(user.userAgent);

            user.os = ua.getOS().name + ' ' + ua.getOS().version;
            if (['Mac OS', 'iOS'].indexOf(ua.getOS().name) !== -1) {
                user.osIcon = 'icon-apple';
            } else {
                user.osIcon = 'icon-' + ua.getOS().name.toLowerCase();
            }
            if (user.invflag && user.invflag == 1) {
                user.invalidflag = true;
            }
            user.browser = ua.getBrowser().name + ' ' + ua.getBrowser().version;
            user.browserIcon = 'icon-' + ua.getBrowser().name.toLowerCase();
            var room = ChatRoom.findOne({ _id: this.rid });
            user.leadid = room.leadid;
            user.label = room.label;
            if (user && user.country == '392') {
                user.country = 'India';
            }
            var departmentname = localStorage.getItem('DepartmentName');
            if (departmentname == 'NewCar') {
                if (cardetails && cardetails.ModelName && cardetails.MakeName && cardetails.PreviousPolicyExpiryDate) {
                    user.carMake = cardetails.ModelName;
                    user.carModel = cardetails.MakeName;
                    user.Expiry = cardetails.PreviousPolicyExpiryDate;
                }
            } else if (departmentname == 'Health') {
                if (healthdetails && healthdetails.MobileNo && healthdetails.AnnualIncome && healthdetails.City && healthdetails.AgeOfAllMembers) {
                    user.MobileNo = healthdetails.MobileNo;
                    user.City = healthdetails.City;
                    user.AgeOfAllMembers = healthdetails.AgeOfAllMembers;
                    user.AnnualIncome = healthdetails.AnnualIncome;
                }
            }
        }

        return user;
    },
    room() {
        return ChatRoom.findOne({ _id: this.rid });
    },

    joinTags() {
        return this.tags && this.tags.join(', ');
    },
    service() {
        var departmentname = localStorage.getItem('DepartmentName');
        var IsService = departmentname.match("_Service");
        const room = Template.instance().currentroom.get();
        if (IsService) {
            return true;
        } else if (departmentname != room.departmentname) {
            return true;
        } else {
            return false;
        }
    },
    customFields() {
        let fields = [];
        let livechatData = {};
        const user = Template.instance().user.get();
        if (user) {
            livechatData = _.extend(livechatData, user.livechatData);
        }

        let data = Template.currentData();
        if (data && data.rid) {
            let room = RocketChat.models.Rooms.findOne(data.rid);
            if (room) {
                livechatData = _.extend(livechatData, room.livechatData);
            }
        }

        if (!_.isEmpty(livechatData)) {
            for (let _id in livechatData) {
                if (livechatData.hasOwnProperty(_id)) {
                    let customFields = Template.instance().customFields.get();
                    if (customFields) {
                        let field = _.findWhere(customFields, { _id: _id });
                        if (field && field.visibility !== 'hidden') {
                            fields.push({ label: field.label, value: livechatData[_id] });
                        }
                    }
                }
            }
            return fields;
        }
    },

    createdAt() {
        if (!this.createdAt) {
            return '';
        }
        return moment(this.createdAt).format('L LTS');
    },

    lastLogin() {
        if (!this.lastLogin) {
            return '';
        }
        return moment(this.lastLogin).format('L LTS');
    },

    editing() {
        return Template.instance().action.get() === 'edit';
    },

    forwarding() {
        return Template.instance().action.get() === 'forward';
    },

    editDetails() {
        const instance = Template.instance();
        const user = instance.user.get();
        return {
            visitorId: user ? user._id : null,
            roomId: this.rid,
            save() {
                instance.action.set();
            },
            cancel() {
                instance.action.set();
            }
        };
    },

    forwardDetails() {
        const instance = Template.instance();
        const user = instance.user.get();
        return {
            visitorId: user ? user._id : null,
            roomId: this.rid,
            save() {
                instance.action.set();
            },
            cancel() {
                instance.action.set();
            }
        };
    },

    roomOpen() {
        const room = ChatRoom.findOne({ _id: this.rid });

        return room.open;
    },

    guestPool() {
        //var departmentname =  localStorage.getItem('DepartmentName');
        //return RocketChat.settings.get('Livechat_Routing_Method_' + departmentname) === 'Guest_Pool';
        //return RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool';
        return false;
    },

    showDetail() {
        if (Template.instance().action.get()) {
            return 'hidden';
        }
    },

    canSeeButtons() {
        if (RocketChat.authz.hasRole(Meteor.userId(), 'livechat-manager')) {
            return true;
        }

        const data = Template.currentData();
        if (data && data.rid) {
            const subscription = RocketChat.models.Subscriptions.findOne({ rid: data.rid });
            return subscription !== undefined;
        }
        return false;
    }
});

Template.visitorInfo.events({
    'click .edit-livechat' (event, instance) {
        event.preventDefault();
        Meteor.call('livechat:getMatrixUrl', this.rid, function(error, result) {
            if (error) {
                console.log(error);
            } else {
                if (result) {
                    window.open(result);
                }
            }
        });
        // instance.action.set('edit');
    },
    'click .close-livechat' (event) {
        event.preventDefault();
        var departmentname = localStorage.getItem('DepartmentName');
        var IsService = departmentname.match("_Service");
        if (IsService) {
            var room = ChatRoom.findOne({ _id: this.rid });
            var leadid = room.leadid;
            swal({
                title: 'Please Update BookingID Before closing chat!',
                type: 'input',
                inputPlaceholder: 'BookingID',
                inputValue: leadid,
                showCancelButton: true,
                closeOnConfirm: false
            }, (inputValue) => {
                var newleadid = inputValue.trim();
                var departmentname = localStorage.getItem('DepartmentName');
                if (newleadid == "0") {
                    var response = "no update needed";
                } else if (!newleadid || s.trim(newleadid) === '') {
                    swal.showInputError('Please enter a valid BookingID');
                    return false;
                } else if (!(newleadid.match(/^[0-9]+$/) != null) || !(newleadid.length >= 7 && newleadid.length <= 9)) {
                    swal.showInputError('BookingID should contain digits only and consist of 7-9 digits! ');
                    return true;
                } else {
                    Meteor.call('livechat:stackChatToLead', room._id, parseInt(newleadid), room.leadid, departmentname, function(error) {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
                swal({
                    title: t('Closing_chat'),
                    type: 'input',
                    inputPlaceholder: t('Please_add_a_comment'),
                    showCancelButton: true,
                    closeOnConfirm: false
                }, (inputValue) => {
                    if (!inputValue) {
                        swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
                        return false;
                    }

                    if (s.trim(inputValue) === '') {
                        swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
                        return false;
                    }

                    Meteor.call('livechat:closeRoom', this.rid, inputValue, function(error /*, result*/ ) {
                        if (error) {
                            return handleError(error);
                        }
                        swal({
                            title: t('Chat_closed'),
                            text: t('Chat_closed_successfully'),
                            type: 'success',
                            timer: 1000,
                            showConfirmButton: false
                        });
                    });
                });
            });
        } else {
            swal({
                title: t('Closing_chat'),
                type: 'input',
                inputPlaceholder: t('Please_add_a_comment'),
                showCancelButton: true,
                closeOnConfirm: false
            }, (inputValue) => {
                if (!inputValue) {
                    swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
                    return false;
                }

                if (s.trim(inputValue) === '') {
                    swal.showInputError(t('Please_add_a_comment_to_close_the_room'));
                    return false;
                }

                Meteor.call('livechat:closeRoom', this.rid, inputValue, function(error /*, result*/ ) {
                    if (error) {
                        return handleError(error);
                    }
                    swal({
                        title: t('Chat_closed'),
                        text: t('Chat_closed_successfully'),
                        type: 'success',
                        timer: 1000,
                        showConfirmButton: false
                    });
                });
            });
        }
    },

    'click .return-inquiry' (event) {
        event.preventDefault();

        swal({
            title: t('Would_you_like_to_return_the_inquiry'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('Yes')
        }, () => {
            Meteor.call('livechat:returnAsInquiry', this.rid, function(error /*, result*/ ) {
                if (error) {
                    console.log(error);
                } else {
                    Session.set('openedRoom');
                    FlowRouter.go('/home');
                }
            });
        });
    },

    'click .forward-livechat' (event, instance) {
        event.preventDefault();

        instance.action.set('forward');
    },

    'click .stack' (event, instance) {
        event.preventDefault();
        var leadid = document.getElementById('leadid').value;
        const room = Template.instance().currentroom.get();
        var departmentname = localStorage.getItem('DepartmentName');
        if (!(leadid.trim())) {
            alert('Please fill valid Leadid!');
            return true;
        } else if (leadid == "0") {
            var repsonse = "no update needed";
        } else if (!(leadid.match(/^[0-9]+$/) != null) || !(leadid.length >= 7 && leadid.length <= 9)) {
            alert('Leadid should contain digits only and consist of 7-9 digits!  ');
            return true;
        } else {
            Meteor.call('livechat:stackChatToLead', room._id, parseInt(leadid), room.leadid, departmentname, function(error) {
                if (error) {
                    console.log(error);
                }
            });
        }
    }
});

Template.visitorInfo.onCreated(function() {
    this.visitorId = new ReactiveVar(null);
    this.customFields = new ReactiveVar([]);
    this.action = new ReactiveVar();
    this.user = new ReactiveVar();
    this.cardetails = new ReactiveVar();
    this.healthdetails = new ReactiveVar();
    this.currentroom = new ReactiveVar();

    Meteor.call('livechat:getCustomFields', (err, customFields) => {
        if (customFields) {
            this.customFields.set(customFields);
        }
    });

    var currentData = Template.currentData();

    if (currentData && currentData.rid) {
        this.autorun(() => {
            let room = ChatRoom.findOne(currentData.rid);
            if (room && room.v && room.v._id) {
                this.visitorId.set(room.v._id);
            } else {
                this.visitorId.set();
            }
            var roomdetails = ChatRoom.findOne({ _id: currentData.rid })
            var departmentname = localStorage.getItem('DepartmentName');
            this.currentroom.set(roomdetails);
            if (roomdetails.departmentname == 'NewCar') {
                Meteor.call('livechat:getCarDetails', roomdetails.leadid, (err, result) => {
                    if (result) {
                        this.cardetails.set(result);
                    }
                });
            } else if (roomdetails.departmentname == 'Health') {
                Meteor.call('livechat:getHealthDetails', roomdetails.leadid, (err, result) => {
                    if (result) {
                        this.healthdetails.set(result);
                    }
                });
            }
        });
        this.subscribe('livechat:visitorInfo', { rid: currentData.rid });
    }
    this.autorun(() => {
        this.user.set(Meteor.users.findOne({ '_id': this.visitorId.get() }));
    });
});