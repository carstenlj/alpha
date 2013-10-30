<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="CssPlayground.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
	<link rel="stylesheet" type="text/css" href="styles/main/main.min.css" />
	<link rel="stylesheet" type="text/css" href="styles/main/input.min.css" />
	<link rel="stylesheet" type="text/css" href="styles/plugins/colorPickify.min.css" />
	<script src="js/jquery-1.10.2.min.js"></script>
	<script src="js/main.js"></script>
	<script src="js/jquery-colorpickify.js"></script>
</head>
<body>
	<script>
		$(function () {
			$('.color-picker').colorPickify();
		});
	</script>

	<div class="content">
		<!-- Color picker -->
		<div class="color-picker">
			<div class="picker-sb">
				<div class="picker"></div>
				<div class="overlay"></div>
			</div>
			<div class="picker-h dragable" data-input-color="hue">
				<div class="picker"></div>
				<div class="huebar dragable" data-input-color="hue"></div>
			</div>
			<div class="right-panel">
				<div class="current">
					<input class="input-hex"/>
				</div>
				<div class="group">
					<span>R</span><input class="input-red" data-input-color="red"/><span data-input-color="red" class="icon-scroll dragable"></span><br />
					<span>G</span><input class="input-green" data-input-color="green"/><span data-input-color="green" class="icon-scroll dragable"></span><br />
					<span>B</span><input class="input-blue" data-input-color="blue"/><span data-input-color="blue" class="icon-scroll dragable"></span><br />
				</div>
				<div class="group" title="Drag handle or scroll with mouse to adjust values">
					<span>H</span><input class="input-hue" data-input-color="hue"/><span data-input-color="hue" class="icon-scroll dragable"></span><br />
					<span>S</span><input class="input-saturation" data-input-color="saturation"/><span data-input-color="saturation" class="icon-scroll dragable"></span><br />
					<span>B</span><input class="input-brightness" data-input-color="brightness"/><span data-input-color="brightness" class="icon-scroll dragable"></span>
				</div>
			</div>
		</div>
	</div>
</body>
</html>

<!--
		Headers
		Subheader
		Text

		Single line text (clear button, mock text)
		Buttons
		Multiline
		Checkboxes
		Dropdowns

		Validation
-->