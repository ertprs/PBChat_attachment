Template.livechatDepartments.helpers({
    departments() {
        if (localStorage.getItem("IsAdmin") === "true") {
            return LivechatDepartment.find();
        } else {
            const departments = Template.instance().departments.get();
            if (departments) {
                return LivechatDepartment.find({ _id: { $in: departments } });
            } else {
                return LivechatDepartment.find({ _id: localStorage.getItem('DepartmentId') });
            }
        }
    }
});

Template.livechatDepartments.events({
    'click .remove-department' (e /*, instance*/ ) {
        e.preventDefault();
        e.stopPropagation();

        swal({
            title: t('Are_you_sure'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: t('Yes'),
            cancelButtonText: t('Cancel'),
            closeOnConfirm: false,
            html: false
        }, () => {
            Meteor.call('livechat:removeDepartment', this._id, function(error /*, result*/ ) {
                if (error) {
                    return handleError(error);
                }
                swal({
                    title: t('Removed'),
                    text: t('Department_removed'),
                    type: 'success',
                    timer: 1000,
                    showConfirmButton: false
                });
            });
        });
    },

    'click .department-info' (e /*, instance*/ ) {
        e.preventDefault();
        FlowRouter.go('livechat-department-edit', { _id: this._id });
    }
});

Template.livechatDepartments.onCreated(function() {
    this.departments = new ReactiveVar([]);
    Meteor.call('livechat:getAgentDepartments', Meteor.userId(), (err, result) => {
        if (result) {
            this.departments.set(result);
        }
    });
    this.subscribe('livechat:departments');
});