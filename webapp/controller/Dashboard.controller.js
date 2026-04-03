sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"com/globe/OneLook_CreateDTDRequest/model/Constants"
], function (Controller, Constants) {
	"use strict";

	/**
	 * Dashboard controller for tile layout..
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.Dashboard
	 */
	return Controller.extend("com.globe.OneLook_CreateDTDRequest.controller.Dashboard", /** @lends com.globe.OneLook_CreateDTDRequest.controller.Dashboard */ {

		/* =========================================================== */
		/* lifecycle methods                                           */

		/* =========================================================== */
		/** 
		 * Main entry point of the application. 
		 * Triggered for each route in the application lifecycle.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute(Constants.ROUTE_DASHBOARD).attachPatternMatched(this.onRouteMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @public
		 */
		onRouteMatched: function () {
			this.setBusyDialogOff();
		},

		/**
		 * Event handler when home link is click on breadcrumbs
		 */
		onPressHome: function () {
			this.fnNavigateToFLP();
		},

		/**
		 * Event handler when tile for single request is clicked.
		 * @param {object} oEvent Contains the event handler of Tile control.
		 */
		onSingleRequest: function (oEvent) {
			// console.log(oEvent);
			var oSource = oEvent.getSource();
			var sTileId = oSource.getId();
			var sRequestType = sTileId.split("--")[1];
			var aMapping = {
				"SingleTradeTile": "TT",
				"SingleNonTradeTile": "NT",
				"SingleDocTitle": "DT"
			};

			if (aMapping[sRequestType] === Constants.TRANS_TYPE_TRADE) {
				if (!this._oAccountType) {
					this._oAccountType = sap.ui.xmlfragment(this.getView().getId(), "com.globe.OneLook_CreateDTDRequest.fragment.Dialog.AccountType",
						this);
					this.getView().addDependent(this._oAccountType);
				}
				this._oAccountType.open();
			} else {
				this.setBusyDialogOn();
				this.getRouter().navTo("CreateRequest", {
					RequestType: aMapping[sRequestType]
				});
			}

		},

		/**
		 * Event handler when tile for bulk request is clicked.
		 * @param {object} oEvent Contains the event handler of Tile control.
		 */
		onBulkRequest: function (oEvent) {
			var oSource = oEvent.getSource();
			// 1. TT - Trade Request
			// 2. NT - Non trade Request
			// 3. DT - Document Request
			var oBulkType = oSource.data("BulkRequestType");
			this.setBusyDialogOn();
			this.fnNavigateTo(Constants.ROUTE_CREATE_BULK_REQUEST, {
				RequestType: oBulkType
			});
		},

		onPressBusiMaterial: function (oEvent) {
			//TO DO
		},

		/**
		 * Event handler when cancel create is clicked
		 */
		onCancelCreate: function () {
			this._oAccountType.close();
		},

		/**
		 * Event handler when create button is clicked
		 */
		onPressCreate: function () {
			var oAccountList = this.byId("AccountTypeList");
			var oSelectedItem = oAccountList.getSelectedItem();

			if (oSelectedItem) {
				this._oAccountType.close();
				oAccountList.removeSelections(); //clear selections
				this.setBusyDialogOn();
				this.getRouter().navTo("CreateRequest", {
					RequestType: Constants.TRANS_TYPE_TRADE,
					AccountType: oSelectedItem.getBindingContext("LocalMasterData").getProperty("AccountType")
				});
			}
		},

		/**
		 * Event handler when Business readiness material link is clicked.
		 */
		onPressSampleGuide: function () {
			sap.m.URLHelper.redirect(Constants.BUSINESS_READINESS_MAT_URL, true);
		}
	});
});