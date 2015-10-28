var PAGE_UserSettings = {
	firstName: null,
	lastName: null,
	email: null,
	n_password: null,
	c_password: null,
	o_password: null,
	avatar: null,
	names: null,
	avatarFile: null,
	sideBarAvatar: null,
	updating: null,



	saveUser: function(){
		if (PAGE_UserSettings.updating) return;

		var userData = new FormData();

		if(PAGE_UserSettings.avatarFile.prop('files').length > 0)
			userData.append('avatar', PAGE_UserSettings.avatarFile.prop('files')[0]);

		userData.append('id', PAGE_UserSettings.user._id);
		if (PAGE_UserSettings.firstName.val()) userData.append('firstname', PAGE_UserSettings.firstName.val());
		if (PAGE_UserSettings.lastName.val()) userData.append('lastname', PAGE_UserSettings.lastName.val());
		if (PAGE_UserSettings.email.val()) userData.append('email', PAGE_UserSettings.email.val());

		if(/\S/.test(PAGE_UserSettings.n_password.val())){
			if(PAGE_UserSettings.n_password.val() == PAGE_UserSettings.c_password.val())
				userData.append('password', PAGE_UserSettings.n_password.val());
			else
				return $.snackbar({content:"Passwords are not equal"});
		}

		if(/\S/.test(PAGE_UserSettings.firstName.val()) && /\S/.test(PAGE_UserSettings.lastName.val()) && /\S/.test(PAGE_UserSettings.email.val())){
			PAGE_UserSettings.updating = true;
			
			if (PAGE_UserSettings.c_password.val() && PAGE_UserSettings.n_password.val()){
				if (!PAGE_UserSettings.o_password.val())
					return $.snackbar({content: 'Please enter your current password'});
			}
			
			$.ajax({
				url: "/scripts/user/update",
				type: 'POST',
				cache: false,
				processData: false,
				contentType: false,
				data : userData,
				success: function(result, status, xhr){
					PAGE_UserSettings.updateUser();
				},
				error: function(xhr, status, error){
					$.snackbar({content: resolveError(error)});
				},
				complete: function(xhr, status){
					PAGE_UserSettings.updating = false;
					location.reload();
				}
			});
		}
		else
			$.snackbar({content: 'Can\'t save blank values'});
	},

	updateImg: function(input) {
	    if (input.files && input.files[0]) {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	            $('#avatar').attr('src', e.target.result);
	        };

	        reader.readAsDataURL(input.files[0]);
	    }
	},

	updateUser: function(user){
		if(PAGE_UserSettings.user._id != null && user == null){
			$.ajax({
				url: API_URL + "/v1/user/profile?id=" + PAGE_UserSettings.user._id,
				type: 'GET',
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err) return this.error(null, null, result.err);

					user = result.data;

					if (user.firstname) {
						PAGE_UserSettings.firstName.val(user.firstname);
						PAGE_UserSettings.firstName.keydown();
					}
					if (user.lastname) {
						PAGE_UserSettings.lastName.val(user.lastname);
						PAGE_UserSettings.lastName.keydown();
					}
					if (user.email) {
						PAGE_UserSettings.email.val(user.email);
						PAGE_UserSettings.email.keydown();
					}

					PAGE_UserSettings.avatar.attr("src", user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png');
					PAGE_UserSettings.sideBarAvatar.attr('src', user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png');
					PAGE_UserSettings.names.html(user.firstname + ' ' + user.lastname);
				},
				error: function(xhr, status, error){
					$.snackbar({content: resolveError(error)});
				}
			});
		}
	}
};

$(document).ready(function(){
	var saveButton = document.getElementById('save-profile');

	PAGE_UserSettings.updating = false;
	PAGE_UserSettings.firstName = $('#first-name');
	PAGE_UserSettings.lastName = $('#last-name');
	PAGE_UserSettings.email = $('#email');
	PAGE_UserSettings.n_password = $('#n_pw');
	PAGE_UserSettings.c_password = $('#c_pw');
	PAGE_UserSettings.o_password = $('#o_pw');
	PAGE_UserSettings.avatarFile = $('#user-profile-file');
	PAGE_UserSettings.avatar = $('#avatar');
	PAGE_UserSettings.sideBarAvatar = $('#side-bar-avatar');
	PAGE_UserSettings.names = $('#user-name-view');

	PAGE_UserSettings.updateUser();

	saveButton.addEventListener('click', function(event){
		PAGE_UserSettings.saveUser();
	});
	$('#user-profile-file').change(function(e){
		PAGE_UserSettings.updateImg(this);
	});
});
