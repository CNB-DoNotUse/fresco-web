/*
** Register Handler
*/

$(document).ready(function(){
	$('.join-submit').on('click', function(e){
		e.preventDefault();
		
		var fn = $(this).siblings('.join-fn').val(),
			ln = $(this).siblings('.join-ln').val(),
			email = $(this).siblings('.join-em').val(),
			//outlet = $(this).siblings('.join-outlet').val(),
			pw = $(this).siblings('.join-pw').val(),
			c_pw = $(this).siblings('.join-c-pw').val();
			
		var params = {
			firstname: fn,
			lastname: ln,
			//outlet: outlet,
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
					success: function(data, textStatus, jqXHR){console.log(data);
						if (data.err)
							return this.error(null, null, data.err);
						
						window.location.replace('/highlights');
					},
					error: function(xhr, status, error){
						if (error == 'ERR_NAME_TAKEN')
							$.snackbar({content: 'That outlet already exists'});
						else
							$.snackbar({content: resolveError(error)});
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
	$('.accept-submit').on('click', function(e){
		e.preventDefault();
		
		var pw = $(this).siblings('.accept-pw').val(),
			params = {
				password: pw
			};
			
		if (typeof oref == 'string')
			params.token = oref;
	
		$.ajax({
			type: "POST",
			url: "/scripts/outlet/invite/accept",
			data: params,
			success: function(data, textStatus, jqXHR){console.log(data);
				if (data.err)
					return this.error(null, null, data.err);
				
				window.location.replace('/highlights');
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
		
		return false;
	});
});