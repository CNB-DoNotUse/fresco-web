var PAGE_OutletSettings = {
	
};

$(document).ready(function(){
	//Display fresco support email when hovering on email link
	$('.outlet-quick-support > ul > li > a').hover(
		function(){
			$(this).html('support@fresconews.com');
		},
		function(){
			$(this).html('Email us');
		}
	);
	
	//Save card info
	$('.card-outlet-card > .outlet-card-save').on('click', function(){
		var _this = $(this),
			exp_times = $('.card-outlet-card > .payment-content .payment-exp').val().split('/'),
			params = {
				"number": $('.card-outlet-card > .payment-content .payment-ccn').val(),
				"cvv": $('.card-outlet-card > .payment-content .payment-cvv').val(),
				"exp-month": exp_times[0].trim(),
				"exp-year": (exp_times[1] || '').trim(),
				"address_zip": $('.card-outlet-card > .payment-content .payment-zip').val(),
				"name": $('.card-outlet-card > .payment-content .payment-name').val(),
				"currency": "usd",
			};
			
		if (!Stripe.card.validateCardNumber(params.number))
			return $.snackbar({content:'Invalid credit card number'});
		if (!Stripe.card.validateExpiry(params['exp-month'], params['exp-year']))
			return $.snackbar({content:'Invalid expiration date'});
		if (!Stripe.card.validateCVC(params.cvv))
			return $.snackbar({content:'Invalid CVV number'});
			
		_this.prop('disabled', true);
		
		var stripeResponseHandler = function(status, response) {
			if (response.error){
				_this.prop('disabled', false);
				return $.snackbar({content: response.error.message});
			}

			$.ajax({
				url: "/scripts/outlet/update",
				type: 'POST',
				data: {
					stripe_token: response.id
				},
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					//window.location.assign('/outlet');
					window.location.reload();
				},
				error: function(xhr, status, error){
					$.snackbar({content:resolveError(error)});
				},
				complete: function(){
					_this.prop('disabled', false);
				}
			});
		};
		
		var form = $('<form></form>');

		for (var index in params)
			form.append('<input type="hidden" data-stripe="' + index + '" value="' + params[index] + '">');

		Stripe.card.createToken(form, stripeResponseHandler);
	});
	
	//Save outlet info
	$('.card-outlet-info > .card-controls > .outlet-info-save').on('click', function(){
		var _this = $(this),
			avatarFiles = $('.card-outlet-info > .outlet-avatar').prop('files'),
			params = new FormData();
			
		if (avatarFiles && avatarFiles.length > 0) params.append('avatar', avatarFiles[0]);
		params.append('bio', $('.card-outlet-info > .card-controls > .outlet-bio').val());
		params.append('link', $('.card-outlet-info > .card-controls > .outlet-website').val());
		params.append('title', $('.card-outlet-info > .card-controls > .outlet-name').val());
			
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
				$.snackbar({content:resolveError(error)});
			},
			complete: function(){
				_this.prop('disabled', false);
			}
		});
	});
	
	//Avatar controls
	$('.card-outlet-info > .card-image > .img-overlay').on('click', function(){
		$('.card-outlet-info > .outlet-avatar').trigger('click');
	});
	$('.card-outlet-info > .outlet-avatar').on('change', function(e){
		var _this = this;
		
		if (_this.files && _this.files[0]) {
			var reader = new FileReader();
	
			reader.onload = function (e) {
				$('.card-outlet-info > .card-image > .img').css('background-image', 'url("'+e.target.result+'")');
			}
	
			reader.readAsDataURL(_this.files[0]);
		}
	});
	
	//Disable all disabled checkboxes
	$('.checkbox.disabled').each(function(i, v){
		$(v).find('label > input').prop('disabled', true);
	});
	
	$('.card-outlet-members .notify-email').change(function(){
		if ($('.card-outlet-members .notify-email-all').is(':checked') || $('.card-outlet-members .notify-email:not([disabled]):not(:checked)').length === 0)
			$('.card-outlet-members .notify-email-all').click();
		else if ($('.card-outlet-members .notify-email:not([disabled]):not(:checked)').length === 0)
			$('.card-outlet-members .notify-email-all').click();
	});
	$('.card-outlet-members .notify-sms').change(function(){
		if ($('.card-outlet-members .notify-sms-all').is(':checked'))
			$('.card-outlet-members .notify-sms-all').click();
		else if ($('.card-outlet-members .notify-sms:not([disabled]):not(:checked)').length === 0)
			$('.card-outlet-members .notify-sms-all').click();
	});
	$('.card-outlet-members .notify-email-all').change(function(){
		if ($(this).is(':checked'))
			$('.card-outlet-members .notify-email:not(:checked)').click();
		else if ($('.card-outlet-members .notify-email:not([disabled]):not(:checked)').length === 0)
			$('.card-outlet-members .notify-email:checked').click();
	});
	$('.card-outlet-members .notify-sms-all').change(function(){
		if ($(this).is(':checked'))
			$('.card-outlet-members .notify-sms:not(:checked)').click();
		else if ($('.card-outlet-members .notify-sms:not([disabled]):not(:checked)').length === 0)
			$('.card-outlet-members .notify-sms:checked').click();
	});
		
	if ($('.card-outlet-members .notify-sms:not([disabled]):not(:checked)').length === 0)
		$('.card-outlet-members .notify-sms-all').click();
	if ($('.card-outlet-members .notify-sms:not([disabled]):not(:checked)').length === 0)
		$('.card-outlet-members .notify-sms-all').click();
		
	$('.outlet-members > li > .delete-member').on('click', function(){
		var _this = $(this),
			listItem = _this.parent('li');
		
		_this.prop('disabled', true);

		$.ajax({
			url: "/scripts/outlet/user/remove",
			method: 'post',
			data: {
				user: listItem.data('user-id')
			},
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);
					
				listItem.slideUp("fast", function() { $(this).remove(); } );
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			},
			complete: function(){
				_this.prop('disabled', false);
			}
		});
	});
	
	$('input.outlet-invite').on('keypress', function(e){
		if (e.which !== 13) return;
		
		var _this = $(this);

		_this.prop('disabled', true);

		var addresses = _this.val().split(' ');

		if (addresses == '' || (addresses.length == 1 && addresses[0].split() == '')){
			e.preventDefault();
			_this.prop('disabled', false);
			$.snackbar({content:'Must invite at least 1 member'});
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

				_this.val('');
				$.snackbar({content: (addresses.length == 1 ? 'Invitation' : 'Invitations') + ' successfully sent!'});
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			},
			complete: function(){
				_this.prop('disabled', false);
			}
		});
	});
});
