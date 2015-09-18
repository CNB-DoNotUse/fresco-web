var db = require('./db.js');
var Assignment = require('./assignment.js');
var async = require('async');

var nyc_location = [74.00, 40.71];

var mile_long = (1/53) * 100;
var mile_lat = (1/69) * 100;

var count = 0;

var added = 0;

for (var x = -50; x < 50; x++)
{
	for(var y = -50; y < 50; y++)
	{
		var location = nyc_location.slice(0,2);
		location[0] += mile_long * x;
		location[1] += mile_lat * y;
		Assignment.add(db,
		{
			title: "Assignment " + (++count),
			caption: "Caption for assignemnt " + count,
			active: true,
			location: 
			{
				geo: {type: "Point", coordinates: location},
				radius: 2,
				googlemaps: "Google Maps"
			}
		}, function(err, data)
		{
			if(err)
			{
				db.close();
				return;
			}
			added += 1;
			if (added % 1000 === 0) {
				console.log("Assignments add: " + added);
			}
			
			if (added == 2000) {
				db.close();
			}
		});
	}
}