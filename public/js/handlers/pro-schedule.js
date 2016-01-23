var schedule = document.getElementById('schedule'),
	blocks = document.getElementsByClassName('blocks');

for (var i = 0; i < blocks.length; i++) {
	blocks[i].addEventListener('click', blockClicked);
}

/**
 * Click handler for schedule block element
 */

function blockClicked(e) {

	console.log(e);

}