sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"com/globe/OneLook_CreateDTDRequest/model/Constants",
	"com/globe/OneLook_CreateDTDRequest/model/formatter",
	"sap/ui/model/json/JSONModel",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"sap/m/MessageBox"
], function (BaseController, Constants, Formatter, JSONModel, Model, MessageBox) {
	"use strict";

	/**
	 * View Request controller for the object header, and table layout.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.ViewRequest
	 */
	return BaseController.extend("com.globe.OneLook_CreateDTDRequest.controller.ViewRequest", /** @lends com.globe.OneLook_CreateDTDRequest.controller.ViewRequest */ {
		formatter: Formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/** 
		 * Main entry point of the application. 
		 * Triggered for each route in the application lifecycle.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute(Constants.ROUTE_VIEW_REQUEST).attachPatternMatched(this.onRouteMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @public
		 */
		onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			this._refno = oArgs.Recnum;
			this.fnInitConfigModel();
			this._fnInitCourierRateModel(oArgs);
			this._fnSetConfigModel(oArgs);
			this.fnAttachedDefferedModel();
			this.setBusyDialogOff();
			// Start of insert - MS223343 - PAL-2023-003
			this._initMasterData();
			// End of insert - MS223343 - PAL-2023-003

			this.getView().getModel().metadataLoaded().then(function () {
				this._path = "/" + this._fnCreateOLHeaderKey();
				this._bindView(this._path);
			}.bind(this));
		},

		/**
		 * Event handler when breadcrumbs is clicked
		 * @param {object} oEvent Contains the link event object.
		 * @public
		 */
		onPressBreadCrumbs: function (oEvent) {
			var sRouteName = oEvent.getSource().data("route");

			if (sRouteName.indexOf("#") <= -1) {
				this.fnNavigateTo(sRouteName);
				return;
			}

			this.fnNavigateToFLP();
		},

		/**
		 * Event handler when Show details/Hide deatils is clicked
		 * toggle display of the items
		 * @param {object} oEvent Contains the event object.
		 * @public
		 */
		onTogglePackageDetails: function (oEvt) {
			var sPath = oEvt.getSource().getBindingContext("viewOLRequest").getPath();
			var oModel = this.getView().getModel("viewOLRequest");
			var bShowDetails = oModel.getProperty(sPath + "/bShowDetails");

			oModel.setProperty(sPath + "/bShowDetails", !bShowDetails);
		},

		/**
		 * Event handler when the file name is  clicked
		 * opens a url to download the file
		 * @param {object} oEvent Contains the event object.
		 * @public
		 */
		onOpenAttachment: function (oEvt) {
			var oSource = oEvt.getSource();
			var oContextModel = oSource.getBindingContext();
			var oContextProp = oContextModel.getObject();
			var sServiceURL = this.getView().getModel().sServiceUrl;
			var sKey = this.getView().getModel().createKey("AttachmentSet", {
				RefNo: oContextProp.RefNo,
				DocItem: oContextProp.DocItem
			});
			var sServiceFile = sServiceURL.concat("/", sKey, "/$value");

			sap.m.URLHelper.redirect(sServiceFile, false);
		},

		/**
		 * Event handler when the Rate your experience was clicked
		 * opens the Courier rating dialog
		 * @public
		 */
		onRateExperience: function () {
			if (!this._oCourierRate) {
				this._oCourierRate = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.RateExperience", this);
				this.getView().addDependent(this._oCourierRate);
			}
			this._oCourierRate.open();
		},
		/**
		 * Event handler when cancel in Rete your experience is clicked
		 * @public
		 */
		onCancelRateCourier: function () {
			var oModel = this.getView().getModel("RateCourier");
			//1. Close dialog
			this._oCourierRate.close();
			//2. Clear fields
			oModel.setProperty("/Remarks", "");
			oModel.setProperty("/CourierRate", "");
		},
		/**
		 * Event handler when submit in Rate your experience is clicked
		 * @public
		 */
		onSubmitRateCourier: function () {
			this.setBusyDialogOn();
			this._validateCourierRating()
				.then(this.fnCallFunctionImport.bind(this, "/RateCourier", "POST"))
				.then(this._fnSuccessRate.bind(this))
				.then(this._onCloseSuccessRate.bind(this))
				.catch(this.fnCatchError.bind(this));
		},
		/**
		 * Event handler when a node in status log is clicked
		 * @public
		 */
		onNodePress: function (oEvt) {
			var oNode = oEvt.getParameters();
			var sPath = oNode.getBindingContext("viewOLRequest").getPath();

			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.StatusLogPopover", this);
				this.getView().addDependent(this._oPopover);
			}
			this._oPopover.bindElement("viewOLRequest>" + sPath);
			this._oPopover.openBy(oNode);
		},
		/**
		 * Event handler when close popover is clicked
		 * @public
		 */
		onClosePopover: function () {
			this._oPopover.close();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */
		/**
		 * Requests an update of courier rating
		 * @param {object} oParam Contains the url parameter
		 * @return {object} Returns promise
		 * @public
		 */
		_fnSuccessRate: function (oParam) {
			return new Promise(function (fnResolve, fnError) {
				this.setBusyDialogOff();
				var i18n = this.getResourceBundle();
				MessageBox.success(i18n.getText("SuccessMsgRateCourier"), {
					onClose: fnResolve
				});
			}.bind(this));
		},
		/**
		 * validates courier rating based on the given rating
		 * @return {object} Returns promise
		 * @public
		 */
		_validateCourierRating: function () {
			return new Promise(function (fnResolve, fnError) {
				var oPayload = this.getView().getModel("RateCourier").getData();
				var i18n = this.getResourceBundle();
				if (oPayload.CourierRate === 0) {
					fnError(i18n.getText("ErrorMsgCourierRate"));
				} else if (oPayload.CourierRate <= 3 && oPayload.Remarks === "") {
					fnError(i18n.getText("ErrorMsgCourierRemarkRequired"));
				} else { //No error found
					fnResolve(oPayload);
				}
			}.bind(this));
		},
		/**
		 * event handler when Ok is clicked in the success dialog
		 * navigates back to the report
		 * @return {object} Returns promise
		 * @public
		 */
		_onCloseSuccessRate: function () {
			this.fnNavigateTo(Constants.ROUTE_REPORT);
		},
		/**
		 * Modify data of config model.
		 * @param {object} oArgs Contains object of routing.
		 * @private
		 */
		_fnSetConfigModel: function (oArgs) {
			var oConfigModel = this.getView().getModel("viewConfig");
			oConfigModel.setProperty("/Recnum", oArgs.Recnum);
		},
		/**
		 * Initialized model for courier rating
		 * @private
		 */
		_fnInitCourierRateModel: function (oArgs) {
			this._courierRating = Model.createCourierRatingModel(oArgs.Recnum);
			this.getView().setModel(this._courierRating, "RateCourier");
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oContext = this;
			var aExpand = [
				"NAV_OLHeader_Item",
				"NAV_OLHeader_Attachment",
				"NAV_OLHeader_ProcessLane",
				"NAV_OLHeader_ProcessNode"
			];
			this.getView().getModel().invalidate();
			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					"expand": aExpand.join(",")
				},
				events: {
					dataRequested: function () {
						oContext.setBusyDialogOn();
					},
					dataReceived: function (oEvent) {
						oContext.setBusyDialogOff();
						oContext._fnProcessDataReceived(oEvent);
					}
				}
			});
		},

		_fnProcessDataReceived: function (oEvent) {
			var oParam = oEvent.getParameter("data");
			if (!oParam) {
				this.getRouter().getTargets().display(Constants.ROUTE_NOT_FOUND);
				return;
			}
			//1. add show details flag
			for (var i = 0; i <= oParam.NAV_OLHeader_Item.length; i++) {
				if (oParam.NAV_OLHeader_Item.hasOwnProperty(i)) {
					oParam.NAV_OLHeader_Item[i].bShowDetails = true;
				}
			}

			//2. Process data from process nodes
			for (var j = 0; j <= oParam.NAV_OLHeader_ProcessNode.length; j++) {
				if (oParam.NAV_OLHeader_ProcessNode.hasOwnProperty(j)) {
					var aTexts = [
						oParam.NAV_OLHeader_ProcessNode[j].StateText1,
						oParam.NAV_OLHeader_ProcessNode[j].StateText2
					];
					oParam.NAV_OLHeader_ProcessNode[j].Texts = aTexts;
				}
			}

			//3. Create local model which will be use for line items.
			this._createLocalModel(oParam);

			//4. Set processflow configuration
			this.getView().byId("StatusProcessFlow").setZoomLevel("Two");
			this.getView().byId("StatusProcessFlow").optimizeLayout(true);

			// Start of insert - MS223343 - PAL-2023-003
			if (oParam.CostCenter !== "") {
				var aFilter = [];
				aFilter.push(new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.EQ, oParam.CostCenter));
				aFilter.push(new sap.ui.model.Filter("CompanyCode", sap.ui.model.FilterOperator.EQ, oParam.CompanyCode));
				this.setBusyDialogOn();
				this.fnReadValueHelp("/ZSSD_COST_CENTER_NODESet", aFilter)
					.then(this._fnSuccessCostCenterNode.bind(this))
					.then(this.setBusyDialogOff.bind(this))
					.catch(this.fnCatchError.bind(this));
			}
			// End of insert - MS223343 - PAL-2023-003

			// Start of insert MS223343 - PAL-2023-004 / 007
			this.fnComputeChargeableWeight(this.getView().getModel("MasterData"), oParam.NAV_OLHeader_Item);
			// End of insert MS223343 - PAL-2023-004 / 007
		},

		// Start of insert - MS223343 - PAL-2023-003
		/**
		 * Initializes masterdata
		 * @private
		 */
		_initMasterData: function () {
			this.getView().setModel(new JSONModel({}), "MasterData");
		},
		// End of insert - MS223343 - PAL-2023-003

		/**
		 * Create a local json model to handle line items data
		 * @param {object} oPayload Contains the received data from bind element.
		 * @private
		 */
		_createLocalModel: function (oPayload) {
			var oModel = new JSONModel(oPayload);
			this.getView().setModel(oModel, "viewOLRequest");
			this.getView().bindElement("viewOLRequest>/");
		},

		/**
		 * Create OData key for OLFHeaderSet
		 * @param {object} oParam Contains payload.
		 * @return {object} Returns created key
		 * @private
		 */
		_fnCreateOLHeaderKey: function () {
			var sKey = this.getView().getModel().createKey("OLHeaderSet", {
				RefNo: this._refno
			});

			return sKey;
		}
	});
});