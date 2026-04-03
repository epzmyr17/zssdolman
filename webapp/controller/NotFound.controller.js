sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"com/globe/OneLook_CreateDTDRequest/model/Constants"
], function (BaseController, Constants) {
	"use strict";

	/**
	 * Controller for unknown pages.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.NotFound
	 */
	return BaseController.extend("com.globe.OneLook_CreateDTDRequest.controller.NotFound", /** @lends com.globe.OneLook_CreateDTDRequest.controller.NotFound */ {

		/** 
		 * Initializes the display.
		 * @public
		 */
		onInit: function () {
			// var oTarget = this.getRouter().getTarget("NotFound");

			// oTarget.attachDisplay(function (oEvent) {
			// 	this._oData = oEvent.getParameter("data"); // store the data
			// }, this);
		},

		/** 
		 * Override the parent's onNavBack (inherited from BaseController).
		 * @returns {void} Returns void to shortcircuit flow.
		 * @public
		 */
		onPressLink: function () {
			this.fnNavigateTo(Constants.ROUTE_DASHBOARD);
		}
	});
});