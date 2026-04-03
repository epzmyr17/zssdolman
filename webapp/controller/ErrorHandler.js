sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function (UI5Object, MessageBox) {
	"use strict";

	/**
	 * Error controller handler
	 * @class
	 * @extends sap.ui.base.Object
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.ErrorHandler
	 */
	return UI5Object.extend("com.globe.OneLook_CreateDTDRequest.controller.ErrorHandler", /** @lends com.globe.OneLook_CreateDTDRequest.controller.ErrorHandler */{

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias com.globe.OneLook_CreateDTDRequest.controller.ErrorHandler
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel("ZSSD_ONELOOK_MDATA_SRV");
			// this._oModelF4Dropdown = oComponent.getModel("F4DropdownMRF");
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("ErrorText");

			// Default model
			this._oModel.attachMetadataFailed(this._fnAttachMetadataFailed.bind(this));
			this._oModel.attachRequestFailed(this._fnAttachRequestFailed.bind(this));
			// F4 Value help model
			// this._oModelF4Dropdown.attachMetadataFailed(this._fnAttachMetadataFailed.bind(this));
			// this._oModelF4Dropdown.attachRequestFailed(this._fnAttachRequestFailed.bind(this));
		},

		/**
		 * Event handler to display error when metadata failed is encountered.
		 * @param {object} oEvent Contains the event object of OData Model.
		 */
		_fnAttachMetadataFailed: function (oEvent) {
			var oParams = oEvent.getParameters();
			this._showServiceError(oParams.response);
		},

		/**
		 * Event handler to display error when failed request from OData sercvice is encountered.
		 * @param {object} oEvent Contains the event object of OData Model.
		 */
		_fnAttachRequestFailed: function (oEvent) {
			var oParams = oEvent.getParameters();
			// An entity that was not found in the service is also throwing a 404 error in oData.
			// We already cover this case with a notFound target so we skip it here.
			// A request that cannot be sent to the server is a technical error that we have to handle though
			if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
					"Cannot POST") === 0)) {
				this._showServiceError(oParams.response);
			}
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError: function (sDetails) {
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			MessageBox.error(
				this._sErrorText, {
					id: "serviceErrorMessageBox",
					details: sDetails,
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		}
	});
});