(function colorPicker($) {
	/***** PLUGIN GLOBAL FUNCTIONS *****/

	// Converts an RGB color value to HSV.
	function rgbToHsv(r, g, b) {
		/**
		 * Converts an RGB color value to HSV. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
		 * Assumes r, g, and b are contained in the set [0, 255] and
		 * returns h, s, and v in the set [0, 1].
		 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
		 *
		 * @param   Number  r       The red color value
		 * @param   Number  g       The green color value
		 * @param   Number  b       The blue color value
		 * @return  Array           The HSV representation
		 */
		r = r / 255, g = g / 255, b = b / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, v];
	}

	// Converts an HSV color value to RGB. 
	function hsvToRgb(h, s, v) {
		/**
		 * Converts an HSV color value to RGB. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
		 * Assumes h, s, and v are contained in the set [0, 1] and
		 * returns r, g, and b in the set [0, 255].
		 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
		 * 
		 * @param   Number  h       The hue
		 * @param   Number  s       The saturation
		 * @param   Number  v       The value
		 * @return  Array           The RGB representation
		 */

		var r, g, b;

		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}

		return [r * 255, g * 255, b * 255];
	}

	// Shorthand isDefined()
	function isDefined(val) {
		return typeof (val) !== 'undefined';
	}

	// Inverts a 0..1 range number to its opposite
	function invert(val) {
		return (val - 1) * -1;
	}
	
	// Returns a zero-padded uppercase base 16 string of value
	function base16(val) {
		var n = Math.round(val).toString(16);
		return (n.length <= 1 ? '0' + n : n).toUpperCase();
	}

	// Clamps val between min and max
	function clamp(min, max, val) {
		val = parseInt(val, 10);
		if (val < min) return min;
		if (val > max) return max;
		return val;
	}

	// Clear text selection for entire DOM
	function clearSelection() {
		if (document.selection) {
			document.selection.empty();
		} else if (window.getSelection) {
			window.getSelection().removeAllRanges();
		}
	}
	
	// Sets background color on element from unrounded RGB color array
	function setBgColorFromArray($el, rgb) {
		$el.css('background-color', 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')');
	}

	// Sets the user-select css style for an element
	function setUserSelect($el, val) {
		$el.css({
			'-webkit-user-select': val,
			'-moz-user-select': val,
			'-ms-user-select': val,
			'-o-user-select': val,
			'user-select': val
		});
	}

	// Global mouseup event that will disable all color picking, and re-enables text selection
	// Dragging is in outer scope, because we allow the user to drag outside the bounds of the control and release the mouse
	var isDragging = false;
	$(document).mouseup(function () {
		isDragging = false;
		$('body')[0].onselectstart = null;
		$('body').css('cursor', '');
		setUserSelect($('body'), '');
	})

	$.fn.colorPicker = function () {
		/***** INTERNAL VARS ****/
		var size = 196;
		var currentInputType = '';
		var current = { H: 360, S: 100, B: 100 };
		var input = {
			hex: this.find(".input-hex"),
			red: this.find(".input-red"),
			green: this.find(".input-green"),
			blue: this.find(".input-blue"),
			hue: this.find(".input-hue"),
			saturation: this.find(".input-saturation"),
			brightness: this.find(".input-brightness"),
			slider_sb : this.find('.picker-sb .picker').show(200),
			slider_h : this.find('.picker-h .picker').show(200)
		}
		var color = {
			preview : this.find('.current'),
			background : this.find('.picker-sb')
		}

		/***** INTERNAL FUNCTIONS *****/

		// Sets a color value for a specific input type
		function setInput(inputType, val)
		{
			// Set the new current color based on what input changed
			switch (inputType) {
				case 'hex':
					setCurrentHsvFromRgb(val[0], val[1], val[2]);
					break;
				case 'red':
					setCurrentHsvFromRgb(clamp(0, 255, val), input.green.val(), input.blue.val());
					break;
				case 'green':
					setCurrentHsvFromRgb(input.red.val(), clamp(0, 255, val), input.blue.val());
					break;
				case 'blue':
					setCurrentHsvFromRgb(input.red.val(), input.green.val(), clamp(0, 255, val));
					break;
				case 'hue':
					current.H = clamp(0, 360, val);
					break;
				case 'saturation':
					current.S = clamp(0, 100, val);
					break;
				case 'brightness':
					current.B = clamp(0, 100, val);
					break;
				default:
			}

			// Update all the UI with the new current color
			updateUI();
		}

		// Gets a normalized value from input element
		function getValue(inputType) {
			var val = input[inputType].val();

			// Perform special normalization for hex value type
			if (inputType == 'hex') {
				if (val[0] === '#')
					val = val.substring(1, 7);

				// Normalize each 4-bit value
				var hexits = [val[0] || 0, val[1] || 0, val[2] || 0, val[3] || 0, val[4] || 0, val[5] || 0];				

				// Determine if hex string is of 16-bit format and convert
				if (isDefined(val[2]) && !isDefined(val[3])) {
					hexits = [val[0], val[0], val[1], val[1], val[2], val[2]];
				}

				// Parse hexit values
				for (var i = 0; i < hexits.length; i++) {
					var parsed = parseInt(hexits[i], 16);
					hexits[i] = isNaN(parsed) ? 15 : parsed;
				}

				// Convert from six 4-bit values to three byte values and return
				return [
					(hexits[0] << 4) + hexits[1],
					(hexits[2] << 4) + hexits[3],
					(hexits[4] << 4) + hexits[5]
				];
			}

			// Regular integer values are normalized
			val = parseInt(val, 10);
			return isNaN(val) ? 0 : val;
		}

		// Sets the current HSB color from RGB
		function setCurrentHsvFromRgb(r,g,b) {
			var hsv = rgbToHsv(r, g, b);
			current.H = hsv[0] * 360;
			current.S = hsv[1] * 100;
			current.B = hsv[2] * 100;
		}

		// Updates the current hue value based on slider movement
		function mouseMoveSliderH(e) {
			var sliderPosH = $('.color-picker .picker-h').position();
			current.H = clamp(0, 360, invert((e.pageY - sliderPosH.top - 8.5) / size) * 360);
			updateUI();
		}

		// Updates the saturation and brightness values based on slider movement	
		function mouseMoveSliderSB(e) {
			var sliderPosSB = $('.color-picker .picker-sb').position();
			current.S = clamp(0, 100, ((e.pageX - sliderPosSB.left + 1) / size) * 100);
			current.B = clamp(0, 100, (invert((e.pageY - sliderPosSB.top - 1) / size) * 100));
			updateUI();
		}

		// Updates all input to reflect current HSB value
		var sliderSizeH = 8.5;
		var sliderRadiusSB = 10 / 2.0;
		function updateUI() {
			// Places the pickers based on current HSB value
			input.slider_h.css({ 'top': clamp(2, size + 2, invert(current.H / 360) * size + 1) });
			input.slider_sb.css({
				'top': clamp(-sliderRadiusSB, size - sliderRadiusSB, invert(current.B / 100) * size - sliderRadiusSB),
				'left': clamp(-sliderRadiusSB, size - sliderRadiusSB, current.S / 100 * size - sliderRadiusSB)
			});

			// Converts the current color to RGB
			var rgb = hsvToRgb(current.H / 360, current.S / 100, current.B / 100);

			//Sets the background of the saturation/brightness picker
			setBgColorFromArray(color.background, hsvToRgb(current.H / 360, 1, 1));

			// Sets the color preview background and the hex code
			setBgColorFromArray(color.preview, rgb);
			input.hex.val("#" + base16(rgb[0]) + base16(rgb[1]) + base16(rgb[2]))

			// Sets the RGB text input values
			input.red.val(Math.round(rgb[0]));
			input.green.val(Math.round(rgb[1]));
			input.blue.val(Math.round(rgb[2]));

			// Sets the HSB text input value
			input.hue.val(Math.round(current.H));
			input.saturation.val(Math.round(current.S));
			input.brightness.val(Math.round(current.B));

			// Updates the color of the hex value to contrast with background
			if (current.B > 75) input['hex'].css('color', "#000");
			else input['hex'].css('color', "#FFF");
		}

		/***** EVENTS *****/

		// Mouse scroll event
		var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"
		this.on(mousewheelevt, function (e) {
			e.preventDefault();
			var inputType = $(e.target).attr("data-type");
			if (!inputType || inputType == 'hex') return;

			var delta = e.originalEvent.wheelDelta || -1 * e.originalEvent.detail;
			var adjust = delta > 0 ? 1 : -1;
			var val = getValue(inputType) + adjust;
			setInput(inputType, val);
			input[inputType].focus();
		});

		// Text changed event
		this.find("input, .dragable").on('input', function (e) {
			// Get input type and skip if undefined
			var inputType = $(e.target).attr("data-type");
			if (!isDefined(inputType) || inputType == 'hex') return;

			var val = getValue(inputType);
			setInput(inputType, val);
		});

		// Blur event for hex input
		this.find(".input-hex").on('blur keydown', function (e) {
			if (e.type == 'keydown' && e.keyCode != 13)
				return;

			setInput('hex', getValue('hex'));
		})

		// Generic mousedown event (activates picking, and ensures no text selection)
		this.mousedown(function (e) {
			// Ensure drag cursor and no text selection while dragging
			isDragging = true;
			clearSelection();
			setUserSelect($('body'), '');
			if(!(/MSIE/i.test(navigator.userAgent)))
				$('body')[0].onselectstart = function (e) { e.preventDefault(); return false; }		
				
			// Determine input type and behavior
			var inputType = $(e.target).attr("data-type");
			var isPickerSB = $(e.target).hasClass("overlay") || $(e.target).hasClass("picker-wrap") || $(e.target).hasClass("picker");
			var isPickerH = $(e.target).hasClass("huebar") || $(e.target).hasClass("picker-h");
			var isDragable = $(e.target).hasClass("dragable")

			// Select the hex input when clicked
			if (inputType == 'hex' || $(e.target).hasClass("current")) {
				input.hex.select();
				e.preventDefault();
			}

			// Set the appropiate active state based on the input type
			currentInputType = '';
			if (isPickerSB) {
				currentInputType = "slider_sb";
				mouseMoveSliderSB(e);
			}
			else if (isPickerH) {
				currentInputType = "slider_h";
				mouseMoveSliderH(e);
				$('body').css('cursor', 'n-resize');
			}		
			else if (isDragable) {
				currentInputType = inputType;
				$('body').css('cursor', 'n-resize');
			}
		});

		// Generic mouseup event (ensures there no active picking element):
		this.mouseup(function (e) {
			currentInputType = '';
		})

		// Mouse move event
		$(document).mousemove(function (e) {
			if (isDragging) {
				e.stopPropagation();
				switch (currentInputType) {
					case 'slider_sb':
						clearSelection();
						mouseMoveSliderSB(e);
						break;
					case 'slider_h':
						clearSelection();
						mouseMoveSliderH(e);
						break;
					default:
						if (currentInputType !== '') {				
							var adjust = clamp(-1, 1, prevY - e.pageY)
							if (adjust == 0) return;

							var val = getValue(currentInputType) + adjust;
							setInput(currentInputType, val);
						}
						break;
				}
			}
			prevY = e.pageY;
		});

		// Initialize color picker UI and return self for chaining
		updateUI();
		return this;
	};
}(jQuery));