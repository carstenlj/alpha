$(function () {
	// Extend jQuerys .val() function to include elements with data-value attribute. 
	// Only meant for getting value and not for setting.
	$.fn.baseVal = $.fn.val;
	$.fn.val = function (value) {
		var dataval = this.attr('data-value');
		if (typeof (value) === 'undefined') {
			if (typeof (dataval) !== 'undefined')
				return dataval;
			else
				return this.baseVal();
		}

		return this.baseVal(value);
	}
});