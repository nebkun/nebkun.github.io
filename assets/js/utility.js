
function retureTimeDifferenceInDays(diff)
{

	var r = {};

	// get total seconds between the times
	var delta = Math.abs(diff) / 1000;

	// calculate (and subtract) whole days
	var days = Math.floor(delta / 86400);

	// calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;

	// calculate (and subtract) whole minutes
	var minutes = Math.floor(delta / 60) % 60;

	// what's left is seconds
	var seconds = Math.floor(delta % 60); 

	if(days>0)
	{
	    r.number = days;
	    r.type = "d";
	}else{
		if(hours>0)
		{
		    r.number = hours;
		    r.type = "h";
		}else{
			if(minutes>0)
			{
			    r.number = minutes;
			    r.type = "m";
			}else{
				if(seconds>0)
				{
				    r.number = seconds;
				    r.type = "s";
				}else{

					r.number = 0;
				    r.type = "";
				}
				
			}
			
		}

	}

	return r;
}