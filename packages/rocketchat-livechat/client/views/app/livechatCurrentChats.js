Template.livechatCurrentChats.helpers({
    livechatRoom() {
        if (localStorage.getItem('IsAdmin') == "true") {
            return ChatRoom.find({ t: 'l' }, { sort: { ts: -1 } });
        } else {
            return ChatRoom.find({ t: 'l' }, { sort: { ts: -1 } });
        }
    },
    startedAt() {
        return moment(this.ts).format('L LTS');
    },
    ActiveSince() {
        if (this.open) {
            return moment(this.ts).fromNow();
        } else {
            return '';
        }
    },
    lastMessage() {
        return moment(this.lm).fromNow();
    },
    isWhatsApp() {
        if (this.waflag == 1) {
            return true;
        } else {
            return false;
        }
    },
    servedBy() {
        return this.servedBy && this.servedBy.username;
    },
    status() {
        return this.open ? t('Close') : t('Closed');
    },
    agents() {
        if (localStorage.getItem("IsAdmin") == "true") {
            return AgentUsers.find({}, { sort: { name: 1 } });
        } else {
            const departments = Template.instance().departmentlist.get();
            var agents = LivechatDepartmentAgents.find({ departmentId: { $in: departments } }, { sort: { name: 1 } }, { username: 1, agentId: 1 }).fetch();
            var distinctagents = _.uniq(agents, false, function(d) { return d.username });
            return distinctagents;
        }
    },
    IsAdmin() {
        if (localStorage.getItem("IsAdmin") == "true") {
            return true;
        } else {
            return false;
        }
    },
    pickupTime() {
        if (this.responseTime) {
            return Math.round(this.responseTime);
        } else {
            return '';
        }
    },
    blocked() {
        //if(BlockedVisitor.find({_id:this.v._id,blocked:true}).fetch().length === 0){
        return 'Block';
        //}
        //else{
        //	return 'Unblock';
        //}
    },
    isOpen() {
        return this.open;
    }
});
Template.livechatCurrentChats.events({
    'click .row-link' () {
        FlowRouter.go('live', { code: this.code });
    },
    'click .load-more' (event, instance) {
        instance.limit.set(instance.limit.get() + 20);
    },
    'submit form' (event, instance) {
        event.preventDefault();

        let filter = {};
        $(':input', event.currentTarget).each(function() {
            if (this.name) {
                filter[this.name] = $(this).val();
                if (this.name == 'agent' || this.name == 'status' || this.name == 'waitingResponse') {
                    var elementid = this.name;
                    Session.set(this.name, document.getElementById(elementid).selectedIndex);
                } else if (this.name == 'From' || this.name == 'To') {
                    var elementid = this.name;
                    Session.set(this.name, document.getElementById(elementid).value);
                }
            }
        });
        instance.filter.set(filter);
        instance.limit.set(20);

        //Method Call for count
        Meteor.call('livechat:getFilteredCount', filter, localStorage.getItem('IsAdmin'), function(error, result) {
            if (error) {
                return handleError(error);
            } else {
                if (result) {
                    document.getElementById('chatcount').value = "Chat Count - " + result;
                } else {
                    document.getElementById('chatcount').value = "Chat Count - 0";
                }
            }
        });
    },
    'click .block-customer' () {
        var Isblock = false;
        var customerblockstatus = document.getElementsByClassName("block-customer")[0].textContent;
        if (customerblockstatus === 'Unblock') {
            Isblock = false;
        } else {
            Isblock = true;
        }
        Meteor.call('livechat:blocklivechatcustomer', this.v._id, Isblock, function(error /*, result*/ ) {
            if (error) {
                return handleError(error);
            } else {
                if (Isblock) {
                    swal('Customer has been blocked');
                } else {
                    swal('Customer has been unblocked');
                }
            }
        });
    },
    'click .close-livechat' (event) {
        event.preventDefault();

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
            Meteor.call('livechat:closeRoom', this._id, inputValue, function(error /*, result*/ ) {
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
});

Template.livechatCurrentChats.onCreated(function() {
    this.limit = new ReactiveVar(20);
    this.departmentlist = new ReactiveVar([]);
    this.filter = new ReactiveVar({});
    this.blockedlist = new ReactiveVar();
    this.subscribe('livechat:agents');
    this.subscribe('livechat:departmentAgents');
    Meteor.call('livechat:getAgentDepartments', Meteor.userId(), (err, result) => {
        if (result) {
            this.departmentlist.set(result);
        }
    });
    this.autorun(() => {
        this.subscribe('livechat:rooms', this.filter.get(), 0, this.limit.get(), null, localStorage.getItem('IsAdmin'));
    });
});

Template.livechatCurrentChats.onRendered(function() {
    var Today = moment().utcOffset(0);
    Today.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    Today.toISOString()
    Today.format()
    var nextday = moment().utcOffset(0);
    nextday.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    nextday.add(1, 'days');
    nextday.toISOString()
    nextday.format()
    $('#datetimepicker6').datetimepicker({
        toolbarPlacement: 'bottom',
        showClose: true,
        sideBySide: true,
        defaultDate: Today
    });
    $('#datetimepicker7').datetimepicker({
        useCurrent: false, //Important! See issue #1075
        toolbarPlacement: 'bottom',
        showClose: true,
        sideBySide: true,
        defaultDate: nextday
    });
    $("#datetimepicker6").on("dp.change", function(e) {
        $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
    });
    $("#datetimepicker7").on("dp.change", function(e) {
        $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
    });
    Meteor.setTimeout(function() {
        if (Session.get('agent') && document.getElementById("agent")) {
            document.getElementById("agent").selectedIndex = Session.get('agent');
        }
        if (Session.get('status') && document.getElementById("status")) {
            document.getElementById("status").selectedIndex = Session.get('status');
        }
        if (Session.get('waitingResponse') && document.getElementById("waitingResponse")) {
            document.getElementById("waitingResponse").selectedIndex = Session.get('waitingResponse');
        }
        if (Session.get('From') && document.getElementById("From")) {
            document.getElementById("From").value = Session.get('From');
        }
        if (Session.get('To') && document.getElementById("To")) {
            document.getElementById("To").selectedIndex = Session.get('To');
        }
    }, 500);
});