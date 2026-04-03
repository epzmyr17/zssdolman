sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"com/globe/OneLook_CreateDTDRequest/controller/ErrorHandler",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (UIComponent, Device, models, ErrorHandler, JSONModel, MessageBox) {
	"use strict";

	return UIComponent.extend("com.globe.OneLook_CreateDTDRequest.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// Set Error Handler for any OData Request.
			this._oErrorHandler = new ErrorHandler(this);

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// get user details
			this.getUserType();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		
		getUserType: function(){
			this.getModel("ZSSD_ONELOOK_MDATA_SRV").read("/ZSSD_USER_TYPESet", {
				success: function(oData){
					if(oData.results.length > 0){
						this.setModel(new JSONModel(oData.results[0]), "UserType");
					}else{ //No assigned role/incomplete assigned role
						var i18n = this.getModel("i18n").getResourceBundle();
						var sUserId = sap.ushell.Container.getService("UserInfo").getId();
						MessageBox.error(i18n.getText("ErrorIncompleteRole",sUserId), {
							onClose: function(){
								var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
								oCrossAppNavigator.toExternal({
									"target": {
										"shellHash": "#Shell-home"
									}
								});
							}
						});
					}
				}.bind(this),
				error: function(oError){
					var sMessage = typeof oError === "string" ? oError : oError.message;
					MessageBox.error(sMessage);
				}
			});
		}
	});
});