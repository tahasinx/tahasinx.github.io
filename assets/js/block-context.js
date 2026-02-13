/**
 * Block context menu (right-click) and keyboard shortcuts
 * to discourage viewing source / dev tools.
 */
(function () {
	"use strict";

	// Block right-click context menu
	document.addEventListener("contextmenu", function (e) {
		e.preventDefault();
		return false;
	});

	// Block keyboard shortcuts
	document.addEventListener("keydown", function (e) {
		// F12 – DevTools
		if (e.key === "F12") {
			e.preventDefault();
			return false;
		}

		// Ctrl+Shift+I – DevTools (Inspector)
		if (e.ctrlKey && e.shiftKey && e.key === "I") {
			e.preventDefault();
			return false;
		}

		// Ctrl+Shift+J – DevTools (Console)
		if (e.ctrlKey && e.shiftKey && e.key === "J") {
			e.preventDefault();
			return false;
		}

		// Ctrl+Shift+C – DevTools (Element picker)
		if (e.ctrlKey && e.shiftKey && e.key === "C") {
			e.preventDefault();
			return false;
		}

		// Ctrl+U – View source
		if (e.ctrlKey && e.key === "u") {
			e.preventDefault();
			return false;
		}

		// Ctrl+S – Save page
		if (e.ctrlKey && e.key === "s") {
			e.preventDefault();
			return false;
		}

		// Cmd+Option+I / Cmd+Option+J / Cmd+Option+C (Mac)
		if (e.metaKey && e.altKey && /^[ijc]$/i.test(e.key)) {
			e.preventDefault();
			return false;
		}

		// Cmd+Option+U (Mac view source)
		if (e.metaKey && e.altKey && e.key === "u") {
			e.preventDefault();
			return false;
		}
	});
})();
