(function treeify($) {
	// Shorthand function
	function isUndefined(val) {
		return typeof (val) === 'undefined';
	}

	// Node fade-in animation
	function fadeIn(node, duration, complete) {
		var height = node.height() || node.css('line-height');
		node.css({ 'opacity': 0, 'height': 0, 'display': '' });

		return node
			.animate(
				{ height: height },
				{ duration: duration / 2, complete: function () {
					node.css('height', '');
				}})
			.animate(
				{ opacity: 1 },
				{ duration: duration / 2, complete: function () {
					node.css('opacity', '');
					if (!isUndefined(complete)) complete();
				}});
	}

	// Node fade-out animation
	function fadeOut(node, complete) {
		function onComplete() {
			node.css({ 'opacity': '', 'height': '', 'display': 'none' });
			if (!isUndefined(complete)) complete();
		}

		return node
			.animate({ opacity: 0 }, 100)
			.animate({ height: 0 }, { duration: 100, complete: onComplete });
	}

	// Creates (if nessecary) and returns the root ul element. Can handle both il and ul elements as input
	function getRootNode(root) {
		var rootType = root[0].nodeName.toLowerCase();
		if (rootType == 'li') {
			if (!root.has('ul').length) return root.append("<ul></ul>").find('ul').first();
			else return root.find("ul").first();	
		}
		else if (rootType != 'ul') {
			throw "treeify: root element is of wrong node type. Must be ul or li";
		}

		return root;
	}

	// Adds a child node to a given tree node element
	function addChildNodes(root, data, noanim) {
		// Get ul element
		root = getRootNode(root);
		data = (typeof (data) === 'string') ? { title: data } : data;
		
		var title = isUndefined(data.title) ? 'TreeNode' : data.title;
		var id = isUndefined(data.id) ? 0 : data.id;
		var type = isUndefined(data.type) ? 0 : data.type;

		// Create the child element. 
		var child = $("<li></li>").attr('data-id', id).attr('data-type', type)
			.append($("<div/>").addClass('icon expander').css('visibility', 'hidden'))
			.append($("<div/>").addClass('icon folder').addClass(type))
			.append($("<span></span>").addClass('title').text(title));

		//Set opacity and height to 0 for fade in animation to look properly
		if (!noanim)
			child.css({ 'opacity': 0, 'height': 0 });

		// Register collapse/expands click event
		child.children().click(function () {		
			var parent = $(this).parent();
			var ul = parent.children("ul");

			if (ul.is(":hidden") && ul.children().length > 0) {
				parent.treeify('expand');
			}
			else if (ul.is(":visible") && ul.children().length > 0) {
				parent.treeify('collapse');
			}			
		});

		// Append the child to parent DOM element
		root.append(child);

		// Function for recursively adding children of data object
		function addDataChildren() {
			if (!isUndefined(data.children) && data.children.length > 0) {
				$.each(data.children, function () {
					addChildNodes(child, this, noanim);
				});
			}
		}

		// Show expander now that node has children
		root.siblings('.expander').css({
			'visibility': '',
			'-webkit-transform': 'rotate(90deg)'
		});

		// Determine to play animation, or add instantly
		if (!noanim) fadeIn(child, 150, addDataChildren);
		else addDataChildren();
	}

	// Removes a child node with a specified id from a given parent node
	function removeChildNode(root, id) {
		var child = (id == null) ? root.parent() : root.find("[data-id=" + id + "]");
		fadeOut(child, function () {
			child.remove();
		});
	}

	// Callapses the child nodes of a given root node
	function collapseNode(root, id) {
		root = (id == null) ? root : getRootNode(root.find('[data-id=' + id + ']'));

		root.siblings(".expander").css('-webkit-transform', 'rotate(0deg)');
		fadeOut(root, function () {
			root.hide();
		});	
	}

	// Expands the childs nodes of a given root node
	function expandNode(root, id) {
		root = (id == null) ? root : getRootNode(root.find('[data-id=' + id + ']'));
		root.show();

		root.siblings(".expander").css('-webkit-transform','rotate(90deg)');
		fadeIn(root, 150);
	}

	// jQuery plugin
	$.fn.treeify = function (command, data, noanim) {
		// Get proper root node (both ul and li element are allowed as the jquery element)
		var root = getRootNode(this);

		// Normalize input data data (allow single objects) and determine id (if submitted)
		var dataUndef = isUndefined(data);
		var id = dataUndef ? null : data;					
		data = !dataUndef && isUndefined(data.length) ? [data] : data;

		// Invoke specific function based on command parameter
		switch (command) {
			case 'add':
				if (typeof (data) === 'string') addChildNodes(root, data, noanim)
				else $.each(data, function () { addChildNodes(root, this, noanim) });
				break;

			case 'remove':
				removeChildNode(root, id);
				break;

			case 'expand':
				expandNode(root, id);
				break;

			case 'collapse':
				collapseNode(root, id);
				break;

			//TODO hide + show

			default: throw "treeify: Unknown command '" + command + "'";
		}

		// Return selected jquery object for chaining
		return this;
	};
}(jQuery));