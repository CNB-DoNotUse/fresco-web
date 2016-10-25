/**
 * Animation object constructor
 */
let Animation = function(screen){
	this.translate3dSupported = this.has3d();
}

/**
 * Dropdown logic and enablement
 */
Animation.prototype.enableDropdown = function() {

	const dropdowns = document.getElementsByClassName('dropdown');
	const optionClicked = function(e){
		const option = e.target;
		const list = option.parentElement;
		const dropdown = list.parentElement;
		const field = dropdown.children[0].children[0];

		//Set the field
		field.innerHTML = option.innerHTML;
		field.style.color = 'black';
		//Set the dropdown dataset
		dropdown.dataset.option = option.innerHTML;

		//Hide the list
		list.style.display = 'none';
	};
	const selectorClicked = function(e) {
		//Toggle the list
		const dropdown = e.target.parentElement;
		const list = dropdown.children[1];

		for (let i = 0; i < dropdowns.length; i++) {
			//Hide all the lists that aren't this one
			if(dropdowns[i].children[1] !== list)
				dropdowns[i].children[1].style.display = 'none';
		}

		if(list.style.display == 'block')
			list.style.display = 'none';
		else
			list.style.display = 'block';
	};

	for (let i = 0; i < dropdowns.length; i++) {
		const dropdown = dropdowns[i];
		const selector = dropdown.children[0];
		const items = dropdown.getElementsByTagName('li');

		for (let j = 0; j < items.length; j++) {
			items[j].addEventListener('click', optionClicked);
		};

		$(selector).click(selectorClicked);
	}
}

/**
 * Check if `translate3d` is supported
 * @return {BOOL} true if supported, false if not
 */
Animation.prototype.has3d = function() {
	if (!window.getComputedStyle) {
	    return false;
	}

	var el = document.createElement('p'), 
	    has3d,
	    transforms = {
	        'webkitTransform':'-webkit-transform',
	        'OTransform':'-o-transform',
	        'msTransform':'-ms-transform',
	        'MozTransform':'-moz-transform',
	        'transform':'transform'
	    };

	// Add it to the body to get the computed style.
	document.body.insertBefore(el, null);

	for (var t in transforms) {
	    if (el.style[t] !== undefined) {
	        el.style[t] = "translate3d(1px,1px,1px)";
	        has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
	    }
	}

	document.body.removeChild(el);

	return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
}

Animation.prototype.getPosition = function(element) {
	let x = 0;
	let y = 0;
	  
	while (element) {
	    x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
	    x += (element.offsetTop - element.scrollTop + element.clientTop);
	    element = element.offsetParent;
	}

	return { x, y };
}

/**
 * Translates an element on the Y axis using translate3d 
 * to ensure that the rendering is done by the GPU
 * @param  {object} elm   Element to translate
 * @param  {float} value Amount to translate
 */
Animation.prototype.translateY3d = function(elm, value) {
	let translate;
	
	if(this.translate3dSupported)
		translate = 'translate3d(0px,' + value + 'px, 0px)';
	else
		translate = 'translate(0px,' + value + 'px)';
	
	elm.style['-webkit-transform'] = translate;
	elm.style['-moz-transform'] = translate;
	elm.style['-ms-transform'] = translate;
	elm.style['-o-transform'] = translate;
	elm.style['transform'] = translate;
}

module.exports = Animation;