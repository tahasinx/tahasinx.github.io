/**
 * Contact form handling with EmailJS
 * Get your IDs at https://dashboard.emailjs.com/
 */
(function () {
	"use strict";

	// -------------------------------------------------------------------------
	// EmailJS configuration – replace with your own from EmailJS dashboard
	// -------------------------------------------------------------------------
	var EMAILJS_CONFIG = {
		serviceID: "service_ct2nl5f",
		templateID: "template_89bca4r",
		publicKey: "sUBF6yboAM2cU0nk8",
	};

	// Cloudflare Turnstile (CAPTCHA) – widget lives in .contact_turnstile_wrap .cf-turnstile in index.html
	var TURNSTILE_WAIT_MS = 6000;
	var TURNSTILE_POLL_MS = 300;
	var turnstileErrorCode = null; // set by contactTurnstileError (e.g. 110200 = domain not authorized)

	window.contactTurnstileError = function (code) {
		turnstileErrorCode = code;
		return true;
	};

	function getTurnstileWidgetId() {
		var el = document.querySelector(".contact_turnstile_wrap .cf-turnstile");
		return el && el.id ? el.id : null;
	}

	function isValidEmail(email) {
		var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).trim());
	}

	function showMessage(selector, html, isError) {
		var $el = jQuery(selector);
		$el.empty().append(html);
		$el.slideDown(500).delay(isError ? 2000 : 4000).slideUp(500);
	}

	function getTurnstileResponse() {
		var el = document.querySelector('[name="cf-turnstile-response"]');
		return el ? el.value : "";
	}

	function resetTurnstile() {
		var id = getTurnstileWidgetId();
		if (id && typeof turnstile !== "undefined" && turnstile.reset) {
			try {
				turnstile.reset("#" + id);
			} catch (e) {}
		}
	}

	function isTurnstileConfigured() {
		var el = document.querySelector(".contact_turnstile_wrap .cf-turnstile");
		var key = el ? el.getAttribute("data-sitekey") : null;
		return key && key !== "YOUR_TURNSTILE_SITEKEY";
	}

	function waitForTurnstile(callback) {
		if (!isTurnstileConfigured()) {
			callback(getTurnstileResponse());
			return;
		}
		var token = getTurnstileResponse();
		if (token) {
			callback(token);
			return;
		}
		var start = Date.now();
		var interval = setInterval(function () {
			token = getTurnstileResponse();
			if (token || Date.now() - start >= TURNSTILE_WAIT_MS) {
				clearInterval(interval);
				callback(token || "");
			}
		}, TURNSTILE_POLL_MS);
	}

	function initContactForm() {
		var $form = jQuery("#contact_form");
		var $returnMessage = jQuery(".contact_form .returnmessage");
		var successText = $returnMessage.data("success") || "Your message has been received. We will contact you soon.";

		// Send button click (form uses <a id="send_message">, so we handle click)
		jQuery(".contact_form #send_message").on("click", function (e) {
			e.preventDefault();

			var name = jQuery("#name").val().trim();
			var email = jQuery("#email").val().trim();
			var message = jQuery("#message").val().trim();

			$returnMessage.empty().hide();
			jQuery(".contact_form .empty_notice").slideUp(500);

			if (!name || !email || !message) {
				jQuery(".contact_form .empty_notice").slideDown(500).delay(2000).slideUp(500);
				return false;
			}

			if (!isValidEmail(email)) {
				showMessage(".contact_form .returnmessage", "<span class='contact_error'>* Invalid email *</span>", true);
				return false;
			}

			// Check if config is still placeholder
			if (
				EMAILJS_CONFIG.serviceID === "YOUR_SERVICE_ID" ||
				EMAILJS_CONFIG.templateID === "YOUR_TEMPLATE_ID" ||
				EMAILJS_CONFIG.publicKey === "YOUR_PUBLIC_KEY"
			) {
				showMessage(
					".contact_form .returnmessage",
					"<span class='contact_error'>EmailJS not configured. Set serviceID, templateID and publicKey in assets/js/email.js</span>",
					true
				);
				return false;
			}

			var $btn = jQuery("#send_message");
			var $btnSpan = $btn.find("span");
			var btnText = $btnSpan.text();

			function doSendEmail() {
				$btnSpan.text("Sending…");
				emailjs
					.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, {
						from_name: name,
						reply_to: email,
						message: message,
					})
					.then(
						function () {
							showMessage(".contact_form .returnmessage", "<span class='contact_success'>" + successText + "</span>", false);
							$form[0].reset();
							resetTurnstile();
						},
						function (err) {
							showMessage(
								".contact_form .returnmessage",
								"<span class='contact_error'>Failed to send. Please try again or use Email/LinkedIn/WhatsApp.</span>",
								true
							);
							console.error("EmailJS error:", err);
							resetTurnstile();
						}
					)
					.finally(function () {
						$btnSpan.text(btnText);
					});
			}

			if (!isTurnstileConfigured()) {
				doSendEmail();
				return false;
			}

			$btnSpan.text("Verifying…");
			waitForTurnstile(function (token) {
				$btnSpan.text(btnText);
				if (!token) {
					var msg =
						turnstileErrorCode === 110200
							? "Domain not authorized. Add this site's domain (e.g. localhost or your domain) in Cloudflare Turnstile → Widget → Hostname Management."
							: "Verification failed. Please try again or use email/WhatsApp below.";
					showMessage(".contact_form .returnmessage", "<span class='contact_error'>" + msg + "</span>", true);
					return;
				}
				doSendEmail();
			});

			return false;
		});
	}

	// Initialize EmailJS with public key and then bind the form
	function boot() {
		if (typeof emailjs === "undefined") {
			console.error("EmailJS SDK not loaded. Add: <script src=\"https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js\"></script>");
			return;
		}
		emailjs.init(EMAILJS_CONFIG.publicKey);
		initContactForm();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
