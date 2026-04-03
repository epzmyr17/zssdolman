sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	/**
	 * Main entry point of the application. This controller is the root view of the whole app.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.App
	 */
	return BaseController.extend("com.globe.OneLook_CreateDTDRequest.controller.App", /** @lends com.globe.OneLook_CreateDTDRequest.controller.App */ {
		/** 
		 * Main entry point of the application. 
		 * Triggered for each route in the application lifecycle.
		 * @public
		 */
		onInit: function () {
			var oComponent = this.getOwnerComponent();

			this.initializeContentDensity(oComponent);
		},

		/** 
		 * Initializes the content (cozy or compact) density for the whole application.
		 * Depending on the platform device.
		 * @param {object} oComponent Application component
		 * @public
		 */
		initializeContentDensity: function (oComponent) {
			this.getView().addStyleClass(oComponent.getContentDensityClass());
		}
	});
});