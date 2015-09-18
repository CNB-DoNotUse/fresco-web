var Assignments = {
	getAllAssignments: function(callback){
		$.ajax(API_URL, {
			success: function(result){
				if(result.err){
					return callback(result.err, null);
				}
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		});
	}
};