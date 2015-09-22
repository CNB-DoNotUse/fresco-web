var PAGE_OutletSettings = {
	saving: false,



	setDisabled: function(disabled){
		$('.outlet-field').prop('disabled', disabled);
	},

	saveCard: function(params, callback){
		if (PAGE_OutletSettings.saving)
			return false;
		if (params.number == '' || params.cvv == '' || params['exp-month'] == '' || params['exp-year'] == '')
			return $.snackbar({content:'All fields must be filled'});

		PAGE_OutletSettings.saving = true;
		PAGE_OutletSettings.setDisabled(true);

		var	params = {
				number: $('.stripe-ccn').val(),
				cvv: $('.stripe-cvv').val(),
				'exp-month': $('.stripe-month').val(),
				'exp-year': $('.stripe-year').val(),
				'currency': 'usd'
			};

		$('stripe-field').removeClass('error');

		if (!Stripe.card.validateCardNumber(params.number)){
			$('.stripe-ccn').addClass('error');
			PAGE_OutletSettings.saving = false;
			PAGE_OutletSettings.setDisabled(false);
			return $.snackbar({content:'Invalid credit card number'});
		}
		if (!Stripe.card.validateExpiry(params['exp-month'], params['exp-year'])){
			$('.stripe-month').addClass('error');
			$('.stripe-year').addClass('error');
			PAGE_OutletSettings.saving = false;
			PAGE_OutletSettings.setDisabled(false);
			return $.snackbar({content:'Invalid expiration date'});
		}
		if (!Stripe.card.validateCVC(params.cvv)){
			$('.stripe-cvv').addClass('error');
			PAGE_OutletSettings.saving = false;
			PAGE_OutletSettings.setDisabled(false);
			return $.snackbar({content:'Invalid CVV number'});
		}

		var stripeResponseHandler = function(status, response) {
			if (response.error){
				PAGE_OutletSettings.saving = false;
				PAGE_OutletSettings.setDisabled(false);
				return $.snackbar({content: response.error.message});
			}

			var saveparams = new FormData();
			saveparams.append('id', PAGE_OutletSettings.outlet._id);
			saveparams.append('stripe_token', response.id);

			$.ajax({
				url: "/scripts/outlet/update",
				type: 'POST',
				data: saveparams,
				dataType: 'json',
				cache:false,
				contentType:false,
				processData:false,
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					//window.location.assign('/outlet');
					window.location.reload();
				},
				error: function(xhr, status, error){
					PAGE_OutletSettings.saving = false;
					PAGE_OutletSettings.setDisabled(false);
					$.snackbar({content:resolveError(error)});
				}
			});
		};

		var form = $('<form></form>');

		for (var index in params)
			form.append('<input type="hidden" data-stripe="' + index + '" value="' + params[index] + '">');

		Stripe.card.createToken(form, stripeResponseHandler);
	},

	saveProfile: function(){
		if (PAGE_OutletSettings.saving)
			return false;

		var params = new FormData(),
			files = $('.outlet-edit-avatar');

		params.append('id', PAGE_OutletSettings.outlet._id);
		params.append('title', $('.outlet-edit-title').val());
		params.append('link', $('.outlet-edit-link').val());

		if (files.prop('files')[0])
			params.append('avatar', files.prop('files')[0]);

		$.ajax({
			url: "/scripts/outlet/update",
			type: 'POST',
			data: params,
			dataType: 'json',
					cache:false,
					contentType:false,
					processData:false,
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);

				//window.location.assign('/outlet');
				window.location.reload();
			},
			error: function(xhr, status, error){
				PAGE_OutletSettings.saving = false;
				PAGE_OutletSettings.setDisabled(false);
				$.snackbar({content: resolveError(error)});
			}
		});
	},

	invite: function(e){
		var textarea = $('textarea.outlet-invite'),
				button = $('button.outlet-invite');

		textarea.prop('disabled', true);
		button.prop('disabled', true);

		var addresses = textarea.val().split(' ');

		if (addresses == '' || (addresses.length == 1 && addresses[0].split() == '')){
			e.preventDefault();
			return false;
		}

		$.ajax({
			url: "/scripts/outlet/invite",
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				emails: addresses
			}),
			dataType: 'json',
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);

				textarea.val('');
				$.snackbar({content: (addresses.length == 1 ? 'Invitation' : 'Invitations') + ' successfully sent!'});
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			},
			complete: function(){
				textarea.prop('disabled', false);
				button.prop('disabled', false);
			}
		});
	}
};

$(document).ready(function(){
	$('.outlet-field').filter(function(){return this.value != '';}).trigger('keydown');
	$('.outlet-field').filter(function(){return this.value == '';}).trigger('keyup');

	$('.outlet-remove-user').on('click', function(evt){
		var listitem = $(this).parent().parent();

		$.ajax({
			url: "/scripts/outlet/user/remove",
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				user: $(this).data('uid')
			}),
			dataType: 'json',
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);
				listitem.slideUp("fast", function() { $(this).remove(); } );
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	});

	$('textarea.outlet-invite').keypress(function(e){
		if (e.which == 13){
			PAGE_OutletSettings.invite(e);
		}
	});
	$('button.outlet-invite').click(function(e){
		PAGE_OutletSettings.invite(e);
	});

	$('.profile-save').on('click', PAGE_OutletSettings.saveProfile);
	$('.stripe-save').on('click', PAGE_OutletSettings.saveCard);
});
