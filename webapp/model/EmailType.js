sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"com/globe/OneLook_CreateDTDRequest/model/Constants"
], function (SimpleType, ValidateException, Constants) {
	"use strict";

	/**
	 * Module for handling email validation.
	 * @exports com.globe.OneLook_CreateDTDRequest.model.EmailType
	 * @author Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 */
	return SimpleType.extend("com.globe.OneLook_CreateDTDRequest.model.EmailType", {
		formatValue: function (oValue) {
			return oValue;
		},

		parseValue: function (oValue) {
			//parsing step takes place before validating step, value could be altered here
			return oValue;
		},

		validateValue: function (oValue) {
			// The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
			// It's always better to validate an address by simply sending an e-mail to it.
			var rexMail = /^$|^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (oValue.length > Constants.EMAIL_MAXLENGTH) {
				throw new ValidateException("Enter a value with no more than " + Constants.EMAIL_MAXLENGTH + " characters");
			} else if (!oValue.match(rexMail)) {
				throw new ValidateException("'" + oValue + "' is not a valid e-mail address");
			}
		}
	});
});