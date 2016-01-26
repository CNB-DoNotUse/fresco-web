var schedule = document.getElementById('schedule');

navResize();

/**
 * Click handler for schedule block element
 */

$('.block').click(function(e) {
	var block = this;

	//Check if the cell is active already
	if(this.className.indexOf('active') > -1){
		animateBlock(this, false, e, function() {
			updateSchedule(block);
		});
	} else {
		animateBlock(this, true, e, function() {
			updateSchedule(block);
		});
	}
});

/**
 * Animates block
 * @param {BOOL} filled To fill, or not to fill
 */

function animateBlock(block, fill, e, callback) {
	var children = block.children,
		circle;

	circle = document.createElement('div');
	circle.className = 'form-circle';
	block.appendChild(circle);

	var parentPosition = animation.getPosition(block),
		xPosition = e.clientX - parentPosition.x - (circle.clientWidth / 2),
		yPosition = e.clientY - parentPosition.y - (circle.clientHeight / 2);
     
    circle.style.left = xPosition + "px";
    circle.style.top = yPosition + "px";
	circle.style.display = 'block';

	if(fill){
		circle.style.background = '#0047bb';
	} else{
		circle.style.background = '#FFFFFF';
	}

	width = $(block).width();
	height = $(block).height();
	r = Math.sqrt(width * width + height * height);

	circle.style.width = r*2 + 'px';
	circle.style.height = r*2 + 'px';
	circle.style.marginLeft = -r + 'px';
	circle.style.marginTop =-r + 'px';

	setTimeout(function(){
		block.removeChild(circle);
		if(fill)
			block.className += ' active';
		else{
			block.className = block.className.replace(/\bactive\b/,'');
		}
		callback();
	}, 200);
}


function updateSchedule(block) {
	var parent = block.parentElement,
		day = parent.getElementsByTagName('p')[0].innerHTML, //Grabs the day from the `p` tag
		time = '',
		morning = false,
		evening = false;
	
	var eveningBlock = parent.getElementsByClassName('evening')[0],
		morningBlock = parent.getElementsByClassName('morning')[0];

	if(eveningBlock.className.indexOf('active') > -1)
		evening = true;

	if(morningBlock.className.indexOf('active') > -1)
		morning = true;

	var params = {
		day: day, 
		morning: morning,
		evening: evening,
		id: proId
	};

	$.ajax({
		method: "POST",
		url: "/scripts/pro/update",
		data: params,
		success: function(response) {
			if (response.err || !response.success)
				return this.error(null, null, response.err);
			else{
				var snackbars = document.getElementById('snackbar-container').children,
					opened = false;

				//Check if there are any opened
				for (var i = 0; i < snackbars.length; i++) {
					if(snackbars[i].className.indexOf('snackbar-opened') > -1)
						opened = true;
				}
				//Only show if none are opened
				if(!opened)
					$.snackbar({ content: 'Schedule updated!'});
			}
		},
		error: function(xhr, status, error) {
			$.snackbar({ content: resolveError(error) });
		}
	});
}