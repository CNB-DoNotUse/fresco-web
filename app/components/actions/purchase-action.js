var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Global purchase actions
 */

var PurchaseAction = React.createClass({

	displayName: 'PurchaseAction',

	render: function(){

		return(

			<span className="mdi mdi-cash icon pull-right" onClick={this.purchase}></span>

		);
		
	},
	//Called whenever the purhcase icon is selected
	purchase: function(event){

		//Check if the prop exists first
		if(!this.props.post) return;

		var post = this.props.post._id,
			assignment = this.props.assignment ? this.props.assignment._id : null

		//Confirm the purchase
		alertify.confirm("Are you sure you want to purchase? This will charge your account. Content from members of your outlet may be purchased free of charge.", function (e) {

		    if (e) {

				//Send request for purchase
				$.ajax({
					url: '/scripts/outlet/checkout',
					dataType: 'json',
					method: 'post',
					contentType: "application/json",
					data: JSON.stringify({
						posts: post,
						assignment:assignment
					}),
					success: function(result, status, xhr){

						console.log(result);

						if (result.err)
							return this.error(null, null, result.err);

						$.snackbar({
							content:'Purchase successful! Visit your <a style="color:white;" href="/outlet">outlet page</a> to view your purchased content', 
							timeout:0
						});

						// var card = thisElem.parents('tile');
						// thisElem.siblings('.mdi-library-plus').remove();
						// thisElem.parent().parent().find('.mdi-file-image-box').addClass('available');
						// thisElem.parent().parent().find('.mdi-movie').addClass('available');
						// card.removeClass('toggled');
						// thisElem.remove();
					},
					error: function(xhr, status, error){
						$.snackbar({
							content:resolveError(error, 'There was an error while completing your purchase!')
						});
					}
				});
		    } else {
		        // user clicked "cancel"
		    }

		});
		
	},

});

module.exports = PurchaseAction;
