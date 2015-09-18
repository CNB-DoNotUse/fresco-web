/*
** Register Handler
*/

var registerSubmit = document.getElementById('register-submit');

registerSubmit.addEventListener('click', function(e){
	e.preventDefault();

	var fn = document.getElementById('fn').value;
	var ln = document.getElementById('ln').value;
	var email = document.getElementById('em').value;
	var outlet = document.getElementById('outlet').value;
	var pw = document.getElementById('pw').value;
	var c_pw = document.getElementById('c_pw').value;
	
	var params = {
			firstname: fn,
			lastname: ln,
			outlet: outlet,
			email: email,
			password: pw
		};
		
	if (typeof oref == 'string')
		params.token = oref;

	//Check if password and confirm password are equal
	if(c_pw == pw){
		//Check if every field is not white space
		if(/\S/.test(fn) && /\S/.test(ln) && /\S/.test(email) && /\S/.test(pw)){
			$.ajax({
				type: "POST",
				url: "/scripts/user/register",
				data: params,
				success: function(data, textStatus, jqXHR){
					if (data.err)
						return this.error(null, null, data.err);
					
					window.location.replace('/highlights');
				},
				error: function(xhr, status, error){
					if (error == 'ERR_NAME_TAKEN')
						$.snackbar({content: 'That outlet already exists'});
					else
						$.snackbar({content: error});
				}
			});
		}
		else{
			//Add error classes to fields
			$.snackbar(
				{
					content: 'Please do not leave all fields blank'
				}
			);
		}
	}
	else{
		$.snackbar(
			{
				content: 'Passwords do not match'
			}
		);
	}
	
	return false;
});