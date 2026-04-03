sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"com/globe/OneLook_CreateDTDRequest/model/Constants",
	"com/globe/OneLook_CreateDTDRequest/model/EmailType",
	"com/globe/OneLook_CreateDTDRequest/model/formatter",
	"sap/m/Dialog",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, History, JSONModel, MessageBox, MessageToast, Model, Constants, EmailType, Formatter, Dialog, Filter,
	FilterOperator) {
	"use strict";

	/**
	 * Parent class for all controller.
	 * @class
	 * @extends sap.ui.core.mvc.Controller
	 * @constructor
	 * @public
	 * @author Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_Processor.controller.BaseController
	 */
	return Controller.extend("com.globe.OneLook_CreateDTDRequest.controller.BaseController", /** @lends com.globe.OneLook_CreateDTDRequest.controller.BaseController */ {
		/**
		 * Helper class formatter
		 */
		formatter: Formatter,

		/**
		 * Email validation
		 */
		types: {
			emailType: new EmailType()
		},

		/* =========================================================== */
		/* Convinience Methods										   */
		/* =========================================================== */

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @returns {sap.ui.core.routing.Router} the router for this component.
		 * @public
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component.
		 * @public
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		onInitController: function () {
			// used for clearing
			this.getView().addEventDelegate({
				onBeforeHide: this.onBeforeHide
			}, this);
		},

		/**
		 * Set Global Busy Indicator On
		 * @public
		 */
		setBusyDialogOn: function () {
			sap.ui.core.BusyIndicator.show(0);
		},

		/**
		 * Set Global Busy Indicator Off
		 * @public
		 */
		setBusyDialogOff: function () {
			sap.ui.core.BusyIndicator.hide(0);
		},

		/**
		 * Display message box error.
		 * @public
		 */
		showMsgBoxError: function (sMsg) {
			MessageBox.error(sMsg);
		},

		/**
		 * Display message box error.
		 * @public
		 */
		showMsgBoxWarning: function (sMsg) {
			MessageBox.warning(sMsg);
		},

		/**
		 * Display message box confirm with promise chain.
		 * @param {string} sMsg Contains text to display in message box.
		 * @return {Promise} Returns a promise resolve after confirmation.
		 * @public
		 */
		showMsgBoxConfirm: function (sMsg) {
			return new Promise(function (fnResolve, fnReject) {
				MessageBox.confirm(sMsg, {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if (sAction === "OK") {
							fnResolve();
						}
					}.bind(this)
				});
			}.bind(this));
		},

		/**
		 * Display message box success with promise chain.
		 * @param {object} oMsg Contains object to display in message box.
		 * @return {Promise} Returns a promise resolve after confirmation.
		 * @public
		 */
		showMsgBoxSuccess: function (oMsg) {
			return new Promise(function (fnResolve, fnReject) {
				MessageBox.success(oMsg.msg, {
					title: oMsg.title,
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						if (sAction === "OK") {
							fnResolve();
						}
					}.bind(this)
				});
			}.bind(this));
		},

		/**
		 * Display dialog with promise chain.
		 * @param {object} oMsg Contains object to display in dialog.
		 * @return {Promise} Returns a promise resolve after confirmation.
		 * @public
		 */
		showDialog: function (oMsg) {
			return new Promise(function (fnResolve, fnReject) {
				var oDialog = new Dialog({
					title: oMsg.title,
					type: "Message",
					state: "Success",
					content: new sap.m.FormattedText({
						htmlText: oMsg.msg
					}),
					endButton: new sap.m.Button({
						text: this.getResourceBundle().getText("Done"),
						type: "Emphasized",
						press: function () {
							oDialog.close();
							fnResolve();
						}.bind(this)
					})
				});
				oDialog.open();
			}.bind(this));
		},

		/* =========================================================== */
		/* Value help related										   */
		/* =========================================================== */

		/**
		 * Event handler when approver input field is clicked
		 * Opens a select dialog when the user can select approver
		 * @public
		 */
		onValueHelpApprover: function (oEvt) {
			this._oInputApprover = oEvt.getSource();
			if (!this._oApproverList) {
				this._oApproverList = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.ApproverList", this);
				this.getView().addDependent(this._oApproverList);
			}

			this._oApproverList.open();
		},

		/**
		 * Event handler when cost center input field is clicked
		 * Opens a select dialog when the user can select cost center
		 * @public
		 */
		onValueHelpCCcode: function (oEvt) {
			this._oInputCC = oEvt.getSource();
			// Start of insert - MS223343 - PAL-2023-003
			var sModelAlias = oEvt.getSource().data("ModelAlias");
			var sCompanyCode = this.getView().getModel(sModelAlias).getProperty("/CompanyCode");
			// End of insert - MS223343 - PAL-2023-003

			// 1. Initialize fragment
			if (!this._oCCList) {
				this._oCCList = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.CostCenterList", this);
				this.getView().addDependent(this._oCCList);
			}

			// Start of insert - MS223343 - PAL-2023-003
			// 2. Filter list of cost center
			var aFilter = [];
			aFilter.push();
			aFilter.push();
			this._oCCList.getBinding("items").filter(
				[
					new Filter("Kostl", FilterOperator.Contains, ""),
					new Filter("Bukrs", FilterOperator.EQ, sCompanyCode)
				]
			);
			// End of insert - MS223343 - PAL-2023-003

			// 3. Open dialog.
			this._oCCList.open();
		},

		// Start of insert MS223343 - PAL-2023-002
		fnCopyItemDetails: function (aItems) {
			if (aItems.length > 1) {
				var oDetail = aItems[0];
				var aFields = ["DeliveryAltContactEmail", "DeliveryAltContactNumber", "DeliveryAltContactPerson", "DeliveryArea",
					"DeliveryBarangay", "DeliveryBarangayDesc", "DeliveryCity", "DeliveryCityDesc", "DeliveryContactEmail", "DeliveryContactNumber",
					"DeliveryContactPerson", "DeliveryDate", "DeliveryHouseNo", "DeliveryLocation", "DeliveryLocationDesc", "DeliveryOrigin",
					"DeliveryOriginDesc", "DeliveryProvince", "DeliveryProvinceDesc", "DeliverySpecLoc", "DeliveryStreet", "DeliverySubdivision",
					"DeliveryTime", "DeliveryUnitNo", "DeliveryZipcode", "PickupAltContactEmail", "PickupAltContactNumber", "PickupAltContactPerson",
					"PickupArea", "PickupBarangay", "PickupBarangayDesc", "PickupCity", "PickupCityDesc", "PickupContactEmail",
					"PickupContactNumber", "PickupContactPerson", "PickupDate", "PickupHouseNo", "PickupLocation", "PickupLocationDesc",
					"PickupOrigin", "PickupOriginDesc", "PickupProvince", "PickupProvinceDesc", "PickupSpecLoc", "PickupStreet", "PickupSubdivision",
					"PickupTime", "PickupUnitNo", "PickupZipcode", "TransportMode", "TransportModeDesc", "DeliveryType", "DeliveryTypeDesc",
					"ContainerType", "ContainerTypeDesc", "TruckType", "TruckTypeDesc", "Courier"
				];
				for (var iItemCounter = 1; iItemCounter < aItems.length; iItemCounter++) {
					for (var iFieldCounter = 0; iFieldCounter < aFields.length; iFieldCounter++) {
						var sField = aFields[iFieldCounter];
						aItems[iItemCounter][sField] = oDetail[sField];
					}
				}
			}
			return aItems;
		},
		// End of insert MS223343 - PAL-2023-002

		/**
		 * Event handler when province input field is clicked
		 * Opens a select dialog when the user can select pronvince.
		 * @param {object} oEvent Contains the input event object.
		 * @public
		 */
		onValueHelpProvince: function (oEvent) {
			this._oInputProvince = oEvent.getSource();
			var sAddressType = oEvent.getSource().data("DetailInfo");
			var sModelAlias = oEvent.getSource().data("ModelAlias");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this._oInputProvince.getBindingContext(sModelAlias).getPath();
			// var oProp = this._oInputProvince.getBindingContext(sModelAlias).getProperty(sPath);
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002

			// 1. Initialize fragment
			if (!this._oProvinceList) {
				this._oProvinceList = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.ProvinceList", this);
				this.getView().addDependent(this._oProvinceList);
			}

			// 2. Filter list of province
			this._oProvinceList.getBinding("items").filter(
				new Filter("Area", FilterOperator.EQ, oProp[sAddressType + "Area"])
			);

			// 3. Open dialog.
			this._oProvinceList.open();
		},

		/**
		 * Event handler when city input field is clicked
		 * Opens a select dialog when the user can select city.
		 * @param {object} oEvent Contains the input event object.
		 * @public
		 */
		onValueHelpCity: function (oEvent) {
			this._oInputCity = oEvent.getSource();
			var sAddressType = oEvent.getSource().data("DetailInfo");
			var sModelAlias = oEvent.getSource().data("ModelAlias");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this._oInputCity.getBindingContext(sModelAlias).getPath();
			// var oProp = this._oInputCity.getBindingContext(sModelAlias).getProperty(sPath);
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002

			// 1. Initialize fragment
			if (!this._oCityList) {
				this._oCityList = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.CityList", this);
				this.getView().addDependent(this._oCityList);
			}

			// 2. Filter list of city
			this._oCityList.getBinding("items").filter(
				new Filter("ProvinceCode", FilterOperator.EQ, oProp[sAddressType + "Province"])
			);

			// 3. Open dialog.
			this._oCityList.open();
		},

		/**
		 * Event handler when brgy input field is clicked
		 * Opens a select dialog when the user can select brgy.
		 * @param {object} oEvent Contains the input event object.
		 * @public
		 */
		onValueHelpBrgy: function (oEvent) {
			this._oInputBrgy = oEvent.getSource();
			var sAddressType = oEvent.getSource().data("DetailInfo");
			var sModelAlias = oEvent.getSource().data("ModelAlias");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this._oInputBrgy.getBindingContext(sModelAlias).getPath();
			// var oProp = this._oInputBrgy.getBindingContext(sModelAlias).getProperty(sPath);
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002

			// 1. Initialize fragment
			if (!this._oBrgyList) {
				this._oBrgyList = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.BrgyList", this);
				this.getView().addDependent(this._oBrgyList);
			}

			// 2. Filter list of brgy
			this._oBrgyList.getBinding("items").filter(
				new Filter("CityCode", FilterOperator.EQ, oProp[sAddressType + "City"])
			);

			// 3. Open dialog.
			this._oBrgyList.open();
		},

		/**
		 * Event handler when address input field is clicked
		 * Opens a select dialog when the user can select pronvince.
		 * @param {object} oEvent Contains the input event object.
		 * @public
		 */
		onValueHelpAddress: function (oEvent) {
			this._oInputAddress = oEvent.getSource();
			var sAddressType = oEvent.getSource().data("DetailInfo");
			var sModelAlias = oEvent.getSource().data("ModelAlias");

			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this._oInputAddress.getBindingContext(sModelAlias).getPath();
			// var oProp = this._oInputAddress.getBindingContext(sModelAlias).getProperty(sPath);
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}

			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			var sKey = oProp[sAddressType + "Origin"];
			var aFilters = [];
			// var aItems = this.getView().getModel(sModelAlias);
			// var sKey = aItems.oData[0][sAddressType + "Origin"];
			// End of edit MS223343 - PAL-2023-002

			// 1. Initialize fragment
			if (!this._oAddressList) {
				this._oAddressList = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.AddressDetailList", this);
				this.getView().addDependent(this._oAddressList);
			}

			// 2. Filter list of 
			aFilters.push(new Filter("PickupLoc", FilterOperator.EQ, sKey));
			aFilters.push(new Filter("TransType", FilterOperator.EQ, this._viewModel.getProperty("/TransactionType")));

			this._oAddressList.getBinding("items").filter(aFilters);

			// 3. Open dialog.
			this._oAddressList.open();
		},

		/* =========================================================== */
		/* Search / Filter Related									   */
		/* =========================================================== */

		/**
		 * Event handler when searching an apppover
		 * @public
		 */
		onSearchApprover: function (oEvt) {
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getParameter("itemsBinding");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter({
					filters: [
						new Filter("NameFirst", sap.ui.model.FilterOperator.Contains, sValue),
						new Filter("NameLast", sap.ui.model.FilterOperator.Contains, sValue),
						new Filter("SmtpAddr", sap.ui.model.FilterOperator.Contains, sValue)
					],
					and: false
				}));
			}
			oBinding.filter(aFilter);

		},

		/**
		 * Event handler when searching for cost center
		 * @public
		 */
		onSearchCostCenter: function (oEvt) {
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getParameter("itemsBinding");
			var aFilter = [];

			// Start of insert - MS223343 - PAL-2023-003
			var oModel = this.getView().getModel("DTDRequest");
			if (!oModel) {
				oModel = this.getView().getModel("editOLRequest");
			}
			aFilter.push(new sap.ui.model.Filter("Kostl", FilterOperator.Contains, sValue));
			aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oModel.getProperty("/CompanyCode")));
			// End of insert - MS223343 - PAL-2023-003

			// Start of delete - MS223343 - PAL-2023-003
			// if (sValue) {
			// 	aFilter.push(new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, sValue));
			// }
			// End of delete - MS223343 - PAL-2023-003
			oBinding.filter(aFilter);
		},

		/**
		 * Event handler when searching for Province
		 * @public
		 */
		onSearchProvince: function (oEvt) {
			var oInput = this._oInputProvince;
			var sAddressType = oInput.data("DetailInfo");
			var sModelAlias = oInput.data("ModelAlias");
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getParameter("itemsBinding");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oInput.getBindingContext(sModelAlias).getPath();
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("ProvinceDesc", FilterOperator.Contains, sValue.toUpperCase()));
			}
			aFilter.push(new Filter("Area", FilterOperator.EQ, oProp[sAddressType + "Area"]));
			oBinding.filter(aFilter);
		},

		/**
		 * Event handler when searching for City
		 * @public
		 */
		onSearchCity: function (oEvt) {
			var oInput = this._oInputCity;
			var sAddressType = oInput.data("DetailInfo");
			var sModelAlias = oInput.data("ModelAlias");
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getParameter("itemsBinding");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oInput.getBindingContext(sModelAlias).getPath();
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("CityDesc", FilterOperator.Contains, sValue.toUpperCase()));
			}
			aFilter.push(new Filter("ProvinceCode", FilterOperator.EQ, oProp[sAddressType + "Province"]));
			oBinding.filter(aFilter);
		},

		/**
		 * Event handler when searching for City
		 * @public
		 */
		onSearchBrgy: function (oEvt) {
			var oInput = this._oInputBrgy;
			var sAddressType = oInput.data("DetailInfo");
			var sModelAlias = oInput.data("ModelAlias");
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getParameter("itemsBinding");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oInput.getBindingContext(sModelAlias).getPath();
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("BarangayText", FilterOperator.Contains, sValue.toUpperCase()));
			}
			aFilter.push(new Filter("CityCode", FilterOperator.EQ, oProp[sAddressType + "City"]));
			oBinding.filter(aFilter);
		},

		/**
		 * Event handler when searching for Address
		 * @public
		 */
		onSearchAddress: function (oEvt) {
			var oInput = this._oInputAddress;
			var sAddressType = oInput.data("DetailInfo");
			var sModelAlias = oInput.data("ModelAlias");
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getParameter("itemsBinding");
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oInput.getBindingContext(sModelAlias).getPath();
			var sPath = "/0";
			if (sModelAlias === "editOLRequest") {
				sPath = "/NAV_OLHeader_Item/0";
			}
			var oProp = this.getView().getModel(sModelAlias).getProperty(sPath);
			// End of edit MS223343 - PAL-2023-002
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("Name", FilterOperator.Contains, sValue.toUpperCase()));
			}
			aFilter.push(new Filter("PickupLoc", FilterOperator.EQ, oProp[sAddressType + "Origin"]));
			aFilter.push(new Filter("TransType", FilterOperator.EQ, this._viewModel.getProperty("/TransactionType")));
			oBinding.filter(aFilter);
		},

		/*
		 * Event handler when approver has been selected from valuehelp
		 * @public
		 */
		onAddApprover: function (oEvt) {
			var oSelectedItem = oEvt.getParameter("selectedItem");
			var oApprover = oSelectedItem.getBindingContext("ZSSD_ONELOOK_MDATA_SRV").getObject();
			var sModelAlias = this._oInputApprover.data("ModelAlias");
			var oModel = this.getView().getModel(sModelAlias);
			//1. Set Approver Details
			this._oInputApprover.setValue(oApprover.NameFirst + " " + oApprover.NameLast);
			oModel.setProperty("/Approver", oApprover.Bname);
			oModel.setProperty("/ApproverEmail", oApprover.SmtpAddr);
			//2. Clear filter upon closing
			oEvt.getSource().getBinding("items").filter([]);
			//3. set field value state
			this._oInputApprover.setValueState(Constants.VALUE_STATE_NONE);
		},

		/**
		 * Event handler when a cost center is selected
		 * @public
		 */
		onAddCostCenter: function (oEvt) {
			var oSelectedItem = oEvt.getParameter("selectedItem");
			var oCostCenter = oSelectedItem.getBindingContext("ZSSD_ONELOOK_MDATA_SRV").getObject();
			//1. Set cost center
			this._oInputCC.setValue(oCostCenter.Kostl);
			//2. validate fields
			this.validateCode();
			// this._oInputCC.setValueState(Constants.VALUE_STATE_NONE);

			// Start of insert - MS223343 - PAL-2023-003
			var oModel = this.getView().getModel("DTDRequest");
			if (!oModel) {
				oModel = this.getView().getModel("editOLRequest");
			}
			var aFilter = [];
			aFilter.push(new sap.ui.model.Filter("Kostl", FilterOperator.EQ, oCostCenter.Kostl));
			aFilter.push(new Filter("CompanyCode", FilterOperator.EQ, oModel.getProperty("/CompanyCode")));
			this.setBusyDialogOn();
			this.fnReadValueHelp("/ZSSD_COST_CENTER_NODESet", aFilter)
				.then(this._fnSuccessCostCenterNode.bind(this))
				.then(this.setBusyDialogOff.bind(this))
				.catch(this.fnCatchError.bind(this));
			// End of insert - MS223343 - PAL-2023-003
		},

		// Start of insert - MS223343 - PAL-2023-003
		_fnSuccessCostCenterNode: function (oData) {
			if (oData.results[0]) {
				var oCostCenter = oData.results[0];
				var sCostCenter = [];
				if (oCostCenter.KostlGroup !== "") {
					sCostCenter.push(oCostCenter.KostlGroup);
				}
				if (oCostCenter.KostlDiv !== "") {
					sCostCenter.push(oCostCenter.KostlDiv);
				}
				if (oCostCenter.KostlDept !== "") {
					sCostCenter.push(oCostCenter.KostlDept);
				}
				oCostCenter.CostCenter = sCostCenter.join(", ");
				this.getView().getModel("MasterData").setProperty("/costCenterNode", oCostCenter);
			}
			return Promise.resolve();
		},
		// End of insert - MS223343 - PAL-2023-003

		onCancelValueHelp: function (oEvt) {
			oEvt.getSource().getBinding("items").filter([]); //clear filter
		},

		/**
		 * builds freight cost parameters
		 * @param {array} aItem Contains item data of request.
		 * @param {object} oHeaderData Contains the header data of request.
		 * @return {object} Returns freightcost parameters
		 * @private
		 */
		// Start of edit MS223343 - PAL-2023-002
		fnBuildFreightCostParameter: function (aItem, oHeaderData) {
			var oParam = {};
			for (var i = 0; i < 10; i++) { //build parameter up to 10 line items
				var sTransportType;
				var sParam = "";
				var oda = 0;

				if (aItem.hasOwnProperty(i)) {
					if (aItem[i].Courier === "" || aItem[i].Courier === null || aItem[i].Courier === undefined) {} else {
						//aItem[i].ValueHelps.Courier[0].oda has a static value.
						//Still need to filter this further according to selected Courier
						var filteredCourier = aItem[i].ValueHelps.Courier.filter(function (el) {
							return el.Courier === aItem[i].Courier;
						});
						if (filteredCourier.length > 0) {
							oda = filteredCourier[0].Oda;
						}
					}
					sTransportType = this.fnFormatTransportType(aItem[i].TransportMode, aItem[i]);
					// sParam = aItem[i].PackageNo + "|" + aItem[i].Courier + "|" + aItem[i].PickupArea + "|" + aItem[i].DeliveryArea + "|" + aItem[i].DeliveryProvince +
					// 	"|" + aItem[i].DeliveryType + "|" + aItem[i].TransportMode + "|" + sTransportType + "|" + aItem[i].Weight + "|" + aItem[i].Length +
					// 	"|" + aItem[i].Width + "|" + aItem[i].Height;
					// Start of edit MS223343 - PAL-2023-003
					// Start of change MS223343 - PAL-2023-010
					sParam = this._viewModel.getProperty("/TransactionType") + "|" + aItem[i].PackageNo + "|" + aItem[i].Courier + "|" + aItem[i].PickupArea +
						"|" + aItem[i].DeliveryArea + "|" + aItem[i].DeliveryProvince + "|" + aItem[i].DeliveryCity + "|" + aItem[i].DeliveryBarangay +
						"|" //Leaving DELIVERY_ZONE blank for now
						+ "|" + aItem[i].DeliveryType + "|" + oda + "|" + aItem[i].TransportMode + "|" + sTransportType +
						"|" + aItem[i].MaterialType + "|" + aItem[i].Weight + "|" + aItem[i].Length + "|" + aItem[i].Width + "|" + aItem[i].Height + "|" +
						aItem[i].Quantity + "|" + oHeaderData.PaymentMode + "|" + oHeaderData.Cashout + "|" + aItem[i].ManpowerServices + "|" +
						aItem[i].Manpower + "|" + aItem[i].CratingServices + "|" + aItem[i].Crate + "|" + oHeaderData.SegmentOrderType + "|" + aItem[i].Amount +
						"|" + Formatter.formatDate(new Date(aItem[i].DeliveryDate)) + "|" + aItem[i].PickupProvince;
					// End of change MS223343 - PAL-2023-010
					// End of edit MS223343 - PAL-2023-003
				}
				oParam["LINE" + ("0" + (i + 1)).slice(-2)] = sParam;
			}
			return oParam;
		},
		// End of edit MS223343 - PAL-2023-002

		/**
		 * Returns the Transport type based on TransportMode
		 * @param {string} sTransportMode Contains mode of transport
		 * @param {object} oItem Contains the item details
		 * @return {string} Returns transport type
		 * @private
		 */
		// Start of chnage MS223343 - PAL-2023-004 / 007
		fnFormatTransportType: function (sTransportMode, oItem) {
			if (sTransportMode === Constants.MODE_OF_TRANSPORT_LAND ||
				sTransportMode === Constants.MODE_OF_TRANSPORT_RORO ||
				sTransportMode === Constants.MODE_OF_TRANSPORT_RORT) {
				return oItem.TruckType;
			} else if (sTransportMode === Constants.MODE_OF_TRANSPORT_SEA) {
				return oItem.ContainerType;
			} else { //air
				return "";
			}
		},
		// End of chnage MS223343 - PAL-2023-004 / 007

		/**
		 * builds serviceable/courier parameter
		 * @param {object} aItems Contains the items
		 * @return {object} Returns servieacble parameter
		 * @private
		 */
		fnBuildCourierParam: function (aItems) {
			var oParam = {};
			for (var i = 0; i < 10; i++) { //build parameter up to 10 line items
				var sParam = "";
				// Start of edit MS223343 - PAL-2023-002
				if (aItems.hasOwnProperty(i)) {
					sParam = aItems[i].PackageNo + "|" + aItems[i].PickupArea + "|" + Formatter.formatDate(new Date(aItems[i].PickupDate)) + "|" +
						aItems[i].DeliveryArea + "|" + aItems[i].DeliveryProvince + "|" + aItems[i].DeliveryCity + "|" + aItems[i].DeliveryBarangay +
						"|" + Formatter.formatDate(new Date(aItems[i].DeliveryDate)) + "|" + aItems[i].DeliveryType + "|" +
						this._viewModel.getProperty("/TransactionType") + "|" + aItems[i].DeliveryTime.getHours() + "|" + aItems[i].DeliveryTime.getMinutes() +
						"|" + aItems[i].DeliveryTime.getSeconds() + "|" + aItems[i].PickupTime.getHours() + "|" + aItems[i].PickupTime.getMinutes() +
						"|" + aItems[i].PickupTime.getSeconds() + "|";
				}
				// End of edit MS223343 - PAL-2023-002
				oParam["LINE" + ("0" + (i + 1)).slice(-2)] = sParam;
			}
			return oParam;
		},

		/* =========================================================== */
		/* Navigation Related										   */
		/* =========================================================== */

		/**
		 * Event handler for navigation.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		fnNavigateTo: function (sRouteName, oParams) {
			this.setBusyDialogOn();

			if (!oParams) {
				this.getRouter().navTo(sRouteName, false);
				return;
			}

			this.getRouter().navTo(sRouteName, oParams, false);
		},

		/**
		 * Event handler to navigate in Home page of Fiori Launchpad.
		 * @public
		 */
		fnNavigateToFLP: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				"target": {
					"shellHash": "#Shell-home"
				}
			});
		},

		/* =========================================================== */
		/* Attachment Related										   */
		/* =========================================================== */

		/**
		 * Opens a message box error when invalid file types is selected.
		 * @public
		 */
		onTypeMissmatch: function () {
			this.showMsgBoxError(this.getResourceBundle().getText("errorUploadFileTypeAttachment"));
		},

		/**
		 * Opens a message box error when invalid file types is selected - Bulk.
		 * @public
		 */
		onTypeMissmatchBulk: function () {
			this.showMsgBoxError(this.getResourceBundle().getText("errorUploadFileTypeBulk"));
		},

		/**
		 * Opens a message box error when max file size exceeded.
		 * @public
		 */
		onFileSizeExceed: function () {
			this.showMsgBoxError(this.getResourceBundle().getText("errorUploadFileSize"));
		},

		/**
		 * Opens a message box error when max file size exceeded - Bulk.
		 * @public
		 */
		onFileSizeExceedBulk: function () {
			this.showMsgBoxError(this.getResourceBundle().getText("errorUploadFileSizeBulk"));
		},

		/* =========================================================== */
		/* Request / Processing of Data								   */
		/* =========================================================== */

		/**
		 * Function to retrieve master data
		 * @public
		 */
		fnReadValueHelp: function (sPath, aFilters) {
			return new Promise(function (fnSuccess, fnError) {
				this.getView().getModel("ZSSD_ONELOOK_MDATA_SRV").read(sPath, {
					filters: aFilters,
					success: fnSuccess,
					error: fnError
				});
			}.bind(this));
		},

		/**
		 * Display error message with message box
		 * @public
		 */
		fnCatchError: function (oError) {
			this.setBusyDialogOff();
			var sMessage = typeof oError === "string" ? oError : oError.message;
			this.showMsgBoxError(sMessage);
		},

		/**
		 * Display error/warning message with message box
		 * @public
		 */
		fnCatchWarningError: function (oError) {
			this.setBusyDialogOff();
			var sMessage = typeof oError === "string" ? oError : oError.message;
			if (oError.hasOwnProperty("type") && oError.type === Constants.ERROR_SEVERITY_WARNING) { //display warning
				this.showMsgBoxWarning(sMessage);
			} else { //display error
				this.showMsgBoxError(sMessage);
			}
		},

		/**
		 * Call function import helper
		 * @param {string} sPath Contains service path
		 * @param {string} sMethod Contains method type
		 * @param {object} oParam Contains service parameters
		 * @public
		 */
		fnCallFunctionImport: function (sPath, sMethod, oParam) {
			return new Promise(function (fnResolve, fnError) {
				var oModel = this.getView().getModel();
				oModel.callFunction(sPath, {
					method: sMethod,
					groupId: Constants.ODATA_GROUP_ID,
					urlParameters: oParam
						// success: fnResolve.bind(this),
						// error: fnError.bind(this)
				});
				fnResolve();
			}.bind(this));
		},

		/**
		 * Retrieves all the estimated shipment cost per item
		 * @param {array} aItemData Contains item data of request.
		 * @param {object} oHeaderData Contains the header data of request.
		 * @return {object} Returns Promise solved  with no parameter
		 * @private
		 */
		fnRequestFreightCost: function (aItemData, oHeaderData) {
			return new Promise(function (fnResolve, fnReject) {
				var oParam = this.fnBuildFreightCostParameter(aItemData, oHeaderData);
				this.getView().getModel().callFunction("/FreightCost", {
					groupId: Constants.ODATA_GROUP_ID,
					method: 'GET',
					urlParameters: oParam
				});
				fnResolve();
			}.bind(this));
		},

		/**
		 * Request for validation if area is serviceable and Retrieves all the couriers 
		 * @return {object} Returns Promise solved with package details as paramater
		 * @private
		 */
		fnCheckCouriers: function (aItemData) {
			return new Promise(function (fnResolve, fnReject) {
				var oParam = this.fnBuildCourierParam(aItemData);
				this.getView().getModel().callFunction("/Serviceable", {
					groupId: Constants.ODATA_GROUP_ID,
					method: 'GET',
					urlParameters: oParam
				});
				fnResolve(aItemData);
			}.bind(this));
		},

		/**
		 * Callback function, after a successfull read submission
		 * @param {object} oData Contains the entry.
		 * @param {object} oResponse Contains information about the response of the request.
		 * @public
		 */
		fnSuccessFreightCost: function (oData) {
			if (oData.hasOwnProperty("__batchResponses") &&
				oData.__batchResponses.length) {

				// Additional checking for status code.
				var sWarningMsg = "";
				var sErrorMsg = "";
				var oResponse = oData.__batchResponses[0];
				if (!oResponse.hasOwnProperty("statusCode") || !(oResponse.statusCode >= 200 && oResponse.statusCode <= 300)) {
					var oErrors = JSON.parse(oResponse.response.body);
					sErrorMsg = oErrors.error.message.value;
				} else { //the request is successful, still need to check for warning messages
					if (oResponse.hasOwnProperty("data") && oResponse.data.hasOwnProperty("results") && oResponse.data.results.length > 0) {
						oResponse.data.results.forEach(function (oResults) {
							// Start of edit MS223343 - PAL-2023-002
							if (oResults.MessageType === "E") {
								sErrorMsg = sErrorMsg + oResults.MessageText + "\n";
							} else if (oResults.MessageType === "W") {
								sWarningMsg = sWarningMsg + oResults.MessageText + "\n";
							}
							// End of edit MS223343 - PAL-2023-002
						});
					}
				}
				if (!sErrorMsg && !sWarningMsg) {
					return Promise.resolve(oData);
				} else if (sErrorMsg) {
					return Promise.reject(sErrorMsg);
				} else { //warning
					var oWarningDetails = {
						message: sWarningMsg,
						type: Constants.ERROR_SEVERITY_WARNING
					};
					//display warning message
					//Since it is only a warning message proceed with processing data of other items
					this.fnCatchWarningError(oWarningDetails);
					return Promise.resolve(oData);
				}
			}
		},

		/**
		 * Callback function, after a successfull  submission of courier
		 * @param {object} oData Contains the data provided by the backend
		 * @public
		 */
		fnSuccessCouriers: function (oData) {
			if (oData.hasOwnProperty("__batchResponses") &&
				oData.__batchResponses.length) {
				var sErrorMsg = "";
				var oResponse = oData.__batchResponses[0];
				if (!oResponse.hasOwnProperty("statusCode") || !(oResponse.statusCode >= 200 && oResponse.statusCode <= 300)) {
					var oErrors = JSON.parse(oResponse.response.body);
					sErrorMsg = sErrorMsg + oErrors.error.message.value;
				} else { //the request is successful, still need to check for error messages
					if (oResponse.hasOwnProperty("data") && oResponse.data.hasOwnProperty("results") && oResponse.data.results.length > 0) {
						oResponse.data.results.forEach(function (oResults) {
							if (oResults.MessageText) {
								sErrorMsg = sErrorMsg + oResults.MessageText + "\n";
							}
						});
					}
				}
				if (sErrorMsg) { //there's an error and should not proceed to next page
					return Promise.reject(sErrorMsg);
				} else {
					return Promise.resolve(oData);
				}
			}
		},

		/**
		 * Callback function, after a successfull submission
		 * @param {object} oData Contains the data of the newly created entry if it is provided by the backend.
		 * @public
		 */
		fnSuccessSubmit: function (oData) {
			if (oData.hasOwnProperty("__batchResponses") &&
				oData.__batchResponses.length &&
				oData.__batchResponses[0].hasOwnProperty("__changeResponses") &&
				oData.__batchResponses[0].__changeResponses.length) {

				// Additional checking for status code.
				var oChangeResponse = this._fnCheckChangeResponse(oData.__batchResponses[0].__changeResponses);
				if (!oChangeResponse) {
					return Promise.resolve(oData);
				} else {
					return Promise.reject(oChangeResponse.message);
				}
			} else {
				var oErrors = JSON.parse(oData.__batchResponses[0].response.body);
				var sErrorDetails = oErrors.error.message.value;

				return Promise.reject(sErrorDetails);
			}
		},

		/**
		 * Request an OData Submit Changes to submit all pending request for transactional odata
		 * @public
		 */
		fnSubmitRequests: function () {
			return new Promise(function (fnResolve, fnReject) {
				this.getView().getModel().submitChanges({
					groupId: Constants.ODATA_GROUP_ID,
					success: fnResolve,
					error: fnReject
				});
			}.bind(this));
		},

		/**
		 * Request an OData Submit Changes to submit all pending request for bulk odata
		 * @public
		 */
		fnSubmitBulkRequests: function () {
			return new Promise(function (fnResolve, fnReject) {
				this.getView().getModel(Constants.ODATA_BULK_MODEL).submitChanges({
					groupId: Constants.ODATA_GROUP_ID,
					success: fnResolve,
					error: fnReject
				});
			}.bind(this));
		},

		/**
		 * Build a base64 format string based from the result of file reader as data url.
		 * @param {object} oItem Contains payload of edit mode.
		 * @param {object} oEvent Contains the event object of file reader as data url.
		 * @return {string} Returns a base64 format string from the uploaded file.
		 * @public
		 */
		fnBuildBase64Attchment: function (oItem, oEvent) {
			var sBase64Marker = 'data:' + oItem.file.type + ';base64,';
			var iBase64Index = oEvent.target.result.indexOf(sBase64Marker) + sBase64Marker.length;
			var sBase64 = oEvent.target.result.substring(iBase64Index);

			return Promise.resolve(sBase64);
		},

		/**
		 * Queue a create batch request for attachment
		 * @param {object} oItem Contains payload of edit mode.
		 * @param {object} sBase64 Contains a base64 string from the uploaded file.
		 * @public
		 */
		fnRequestAttachment: function (oItem, sId, sPath, sBase64) {
			var oPayload = {
				"XSTRING": sBase64
			};
			this.getView().getModel().create(sPath, oPayload, {
				headers: {
					slug: sId + "|" + oItem.FileName + "|" + oItem.FileSize + "|" + oItem.Icon + "|" + oItem.MimeType
				},
				groupId: Constants.ODATA_GROUP_ID
			});
		},

		/**
		 * Queue a create batch request for attachment
		 * @param {object} oItem Contains payload of edit mode.
		 * @param {object} sBase64 Contains a base64 string from the uploaded file.
		 * @public
		 */
		fnRequestBulkAttachment: function (oItem) {
			var oPayload = {
				"XSTRING": oItem.base64
			};
			this.getView().getModel(Constants.ODATA_BULK_MODEL).create(oItem.path, oPayload, {
				headers: {
					slug: oItem.slug
				},
				groupId: Constants.ODATA_GROUP_ID
			});
		},

		/**
		 * Read the file as data url using JS FileReader.
		 * @param {object} oItem Contains payload of edit mode.
		 * @public
		 */
		fnReadAttachment: function (oItem) {
			return new Promise(function (fnResolve, fnReject) {
				var oFileReader = new FileReader();
				oFileReader.readAsDataURL(oItem.file);
				oFileReader.onload = fnResolve;
			});
		},

		/**
		 * Queue a delete request for Onelook Header
		 * @param {object} oItem Contains payload of edit mode.
		 * @public
		 */
		fnRequestDeleteDTD: function (oItem) {
			var sKey = this.getModel().createKey("OLHeaderSet", {
				RefNo: oItem.RefNo
			});
			// this.getView().getModel().setDeferredGroups([Constants.ODATA_GROUP_ID]);
			this.getView().getModel().remove("/" + sKey, {
				groupId: Constants.ODATA_GROUP_ID
			});

			return Promise.resolve();
		},

		/**
		 * Loop and check each change reponse if an error is occured using status code.
		 * @param {array} Contains the change resonse of batch request.
		 * @return {object} Returns an error reponse if applicable.
		 */
		_fnCheckChangeResponse: function (aChangeResponse) {
			var oErrorResponse = null;

			aChangeResponse.forEach(function (oItem) {
				if (!oItem.hasOwnProperty("statusCode") || !(oItem.statusCode >= 200 && oItem.statusCode <= 300)) {
					oErrorResponse = oItem;
					return;
				}
			});

			return oErrorResponse;
		},

		/* =========================================================== */
		/* Initializing of Model									   */
		/* =========================================================== */

		/**
		 * Initialize message manager for validation error
		 * @public
		 */
		fnInitMessageManager: function () {
			this._oMessageManager = new sap.ui.core.message.MessageManager();

			this._oMessageManager.registerObject(this.getView(), true);
			this.getView().setModel(this._oMessageManager.getMessageModel(), "message");
		},

		/**
		 * Attached deffered to OData model, for the submission of function import
		 * @public
		 */
		fnAttachedDefferedModel: function () {
			var oModel = this.getOwnerComponent().getModel();
			var aGroupId = [Constants.ODATA_GROUP_ID];
			var aDeferredGroups = oModel.getDeferredGroups().concat(aGroupId);

			oModel.setDeferredGroups(aDeferredGroups);
			oModel.setChangeGroups({
				OLHeader: {
					groupId: aGroupId[0],
					single: false
				},
				OLItemSet: {
					groupId: aGroupId[0],
					single: false
				},
				FreightCostNonTrade: {
					groupId: aGroupId[0],
					single: false
				},
				CreateFinalDTD: {
					groupId: aGroupId[0],
					single: false
				},
				Attachment: {
					groupId: aGroupId[0],
					single: false
				}
			});
		},

		/**
		 * Attached deffered to OData model, for the submission of request
		 * @public
		 */
		fnAttachedBulkDefferedModel: function () {
			var oModel = this.getOwnerComponent().getModel(Constants.ODATA_BULK_MODEL);
			var aGroupId = [Constants.ODATA_GROUP_ID];
			var aDeferredGroups = oModel.getDeferredGroups().concat(aGroupId);

			oModel.setDeferredGroups(aDeferredGroups);
			oModel.setChangeGroups({
				OLBulkHeader: {
					groupId: aGroupId[0],
					single: false
				},
				OLBulkAttachment: {
					groupId: aGroupId[0],
					single: false
				}
			});
		},

		/**
		 * remove messages from message manager
		 * @public
		 */
		fnRemoveMessageManager: function () {
			this._oMessageManager.removeAllMessages();
		},

		/**
		 * Initial local model for config
		 * @public
		 */
		fnInitConfigModel: function () {
			var oModel = Model.createViewConfigModel();

			this.getView().setModel(oModel, "viewConfig");
		},

		/* =========================================================== */
		/* Validation of Fields										   */
		/* =========================================================== */

		/**
		 * Validates if either WBS or Cost center code was populated
		 * @param {object} oDynamicForm Contains details of the form
		 * @param {string} sTransactionType Contains the transaction type
		 * @param {boolean} isDraft Contains saving type if draft  or not
		 * @return {object} Returns Promise resolve if there is no validation error
		 * @private
		 */
		_fnValidateRequiredFields: function (oDynamicForm, sTransactionType, isDraft) {
			return new Promise(function (fnResolve, fnReject) {
				if (isDraft) { //if draft no need to validate fields
					fnResolve(isDraft);
				} else {
					var i18n = this.getResourceBundle();
					var bCodeValidationError = this.validateCode();
					var bValidationError = this.fnValidateRequiredFields(oDynamicForm, sTransactionType) || bCodeValidationError;
					if (bValidationError) {
						fnReject(i18n.getText("ValidationError"));
					} else {
						fnResolve(isDraft);
					}
				}
			}.bind(this));
		},

		/**
		 * Validates if either WBS or Cost center code was populated
		 * @return {boolean} Returns true if a validation error occured
		 * @private
		 */
		validateCode: function () {
			var oWbsInput = this.getView().byId("WbsCodeInput");
			var oCCInput = this.getView().byId("CCCodeInput");
			// Start of edit - MS223343 - PAL-2023-003
			var oIOInput = this.getView().byId("IOChargingAccountInput");
			var aControls = [oWbsInput, oCCInput, oIOInput];

			if (oWbsInput.getValue() !== "" || oCCInput.getValue() !== "" || oIOInput.getValue() !== "") {
				// End of edit - MS223343 - PAL-2023-003
				var bValidationError = false; //for overall validation
				aControls.forEach(function (oControl) {
					var bError = false; //internal validation
					try {
						var oBinding = oControl.getBinding("value");
						oBinding.getType().validateValue(oControl.getValue());
					} catch (oException) {
						oControl.setValueState(Constants.VALUE_STATE_ERROR);
						bError = true;
						bValidationError = true;
					}
					if (!bError) {
						oControl.setValueState(Constants.VALUE_STATE_NONE);
					}
				});
				return bValidationError;
			} else { //else no selected value for wbs and cc
				oWbsInput.setValueState("Error");
				oCCInput.setValueState("Error");
				oIOInput.setValueState("Error");
				return true;
			}
		},

		/**
		 * Validate required fields per transaction type
		 * @param {object} oForm Contains the form to reset
		 * @param {string} sTransactionType Contains the transaction type
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		fnValidateRequiredFields: function (oForm, sTransactionType) {
			var aRequiredFields = oForm.getControlsByFieldGroupId(sTransactionType);
			var bValidationError = false;

			aRequiredFields.forEach(function (oControl) {
				var bFieldValidationError = this._fnValidateFields(oControl);
				if (bFieldValidationError) {
					bValidationError = bFieldValidationError;
				}
			}.bind(this));

			return bValidationError;
		},

		/**
		 * Validate required fields per transaction type
		 * @param {object} oContro Contains control detail
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		_fnValidateFields: function (oControl) {
			var oFieldValidation = {
				"sap.m.Input": this._fnValidateInputField,
				"sap.m.TextArea": this._fnValidateTextAreaField,
				"sap.m.ComboBox": this._fnValidateComboBoxField,
				"sap.m.DatePicker": this._fnValidateDateTimePicker,
				"sap.m.TimePicker": this._fnValidateDateTimePicker,
				"sap.ui.unified.FileUploader": this._fnValidateFileUploader
			};
			var sControlType = oControl.getMetadata().getName();

			if (oFieldValidation.hasOwnProperty(sControlType)) {
				return oFieldValidation[sControlType].call(this, oControl);
			}
			// If there is no error in validation return false
			return false;
		},

		/**
		 * Validate text area field and set the value state to 'error'
		 * when validation error occured
		 * @param {object} oContro Contains control detail
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		_fnValidateTextAreaField: function (oControl) {
			var oBinding = oControl.getBinding("value");
			try {
				oBinding.getType().validateValue(oControl.getValue());
			} catch (oException) {
				oControl.setValueState(Constants.VALUE_STATE_ERROR);
				return true; //error validation
			}
			oControl.setValueState(Constants.VALUE_STATE_NONE);
			return false; //no error in validation 
		},

		/**
		 * Validate text input field and set the value state to 'error'
		 * when validation error occured
		 * @param {object} oContro Contains control detail
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		_fnValidateInputField: function (oControl) {
			var sValue = oControl.getValue().trim();
			var sNumberType = oControl.data("NumberType");
			var oBinding = oControl.getBinding("value");

			if (parseFloat(sValue) === 0 && oControl.getType() === Constants.INPUT_TYPE_NUMBER && oControl.getVisible() && oControl.getRequired()) {
				oControl.setValueState(Constants.VALUE_STATE_ERROR);
				return true; //error validation
			} else if (sNumberType && oControl.getRequired() && oControl.getVisible()) {
				var bValidationError = false;
				if (sNumberType === Constants.NUMBER_TYPE_NUMERIC) {
					bValidationError = !Number.isInteger(parseFloat(sValue));
				} else { //Decimal
					var sDecimal = sValue.split(".")[1];
					bValidationError = sDecimal && sDecimal.length > 3;
				}

				if (bValidationError) {
					oControl.setValueState(Constants.VALUE_STATE_ERROR);
					return bValidationError; //error validation
				} else { //Additional validation
					try {
						oBinding.getType().validateValue(oControl.getValue());
					} catch (oException) {
						oControl.setValueState(Constants.VALUE_STATE_ERROR);
						return true; //error validation
					}
					oControl.setValueState(Constants.VALUE_STATE_NONE);
					return false; //no error in validation 
				}
			} else if (oControl.getType() === Constants.INPUT_TYPE_EMAIL && oControl.getVisible() && sValue !== "") {
				try {
					this.types.emailType.validateValue(oControl.getValue());
				} catch (oException) {
					oControl.setValueState(Constants.VALUE_STATE_ERROR);
					oControl.setValueStateText(oException.message);
					return true; //error validation
				}
				oControl.setValueState(Constants.VALUE_STATE_NONE);
				return false; //no error in validation 
			} else if (sValue === "" && oControl.getVisible() && oControl.getRequired()) {
				oControl.setValueState(Constants.VALUE_STATE_ERROR);
				return true; //error validation
			} else if (!oControl.getRequired()) { //for not required fields
				try {
					oBinding.getType().validateValue(oControl.getValue());
				} catch (oException) {
					oControl.setValueState(Constants.VALUE_STATE_ERROR);
					oControl.setValueStateText(oException.message);
					return true; //error validation
				}
				oControl.setValueState(Constants.VALUE_STATE_NONE);
				return false; //no error in validation 
			} else { //else no error with the required fields
				oControl.setValueState(Constants.VALUE_STATE_NONE);
				return false; //no error in validation 
			}
		},

		/**
		 * Validate combo box field and set the value state to 'error'
		 * when validation error occured
		 * @param {object} oContro Contains control detail
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		_fnValidateComboBoxField: function (oControl) {
			var sSelectedKey = oControl.getSelectedKey();

			if (sSelectedKey === "" && oControl.getVisible()) {
				oControl.setValueState(Constants.VALUE_STATE_ERROR);
				return true; //error validation
			}
			oControl.setValueState(Constants.VALUE_STATE_NONE);
			return false;
		},

		/**
		 * Validate text date time field and set the value state to 'error'
		 * when validation error occured
		 * @param {object} oContro Contains control detail
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		_fnValidateDateTimePicker: function (oControl) {
			var dValue = oControl.getDateValue();

			if ((!(dValue instanceof Date) || isNaN(dValue)) && oControl.getVisible()) {
				oControl.setValueState(Constants.VALUE_STATE_ERROR);
				return true; //error validation
			}
			oControl.setValueState(Constants.VALUE_STATE_NONE);
			return false;
		},

		/**
		 * Validate file uploader and set the value state to 'error'
		 * when validation error occured
		 * @param {object} oContro Contains control detail
		 * @return {boolean} Returns true if validation error ancountered
		 * @public
		 */
		_fnValidateFileUploader: function (oControl) {
			var sValue = oControl.getValue().trim();

			if (sValue === "" && oControl.getVisible()) {
				oControl.setValueState(Constants.VALUE_STATE_ERROR);
				return true; //error validation
			}
			oControl.setValueState(Constants.VALUE_STATE_NONE);
			return false;
		},

		/**
		 * Check if there error messages from message manager
		 * @public
		 */
		fnValidateMessageManager: function () {
			var oModel = this.getView().getModel("message");
			// if no length, then all is valid
			return !oModel.getData().length;
		},

		/**
		 * Reset value state of the required fields
		 * @param {object} oForm Contains the form to reset
		 * @param {string} sTransactionType Contains the transaction type
		 * @public
		 */
		fnResetRequiredFieldStates: function (oForm, sTransactionType) {
			var aRequiredFields = oForm.getControlsByFieldGroupId(sTransactionType);

			var oFieldValidation = {
				"sap.m.Input": this._fnValidateInputField,
				"sap.m.TextArea": this._fnValidateInputField,
				"sap.m.ComboBox": this._fnValidateComboBoxField,
				"sap.m.DatePicker": this._fnValidateDateTimePicker,
				"sap.m.TimePicker": this._fnValidateDateTimePicker,
				"sap.ui.unified.FileUploader": this._fnValidateFileUploader
			};

			aRequiredFields.forEach(function (oControl) {
				var sControlType = oControl.getMetadata().getName();
				if (oFieldValidation.hasOwnProperty(sControlType)) {
					oControl.setValueState("None");
				}
			});
		},

		// Start of insert MS223343 - PAL-2023-004 / 007
		/**
		 * Compute total chargeable weight
		 * @param {aray} aItems Contains the items to compute
		 * @param {object} oModel Contains the model to update
		 * @public
		 */
		fnComputeChargeableWeight: function (oModel, aItems) {
			var iChargeableWeight = 0;

			aItems.forEach(function (oItem) {
				var iWeight = parseFloat(oItem.Weight);
				var iVolumeMetricWeight = parseFloat(Formatter.formatVolumeMetricWeight(oItem.Length, oItem.Width, oItem.Height));

				if (iVolumeMetricWeight > iWeight) {
					iWeight = iVolumeMetricWeight;
				}

				iChargeableWeight += iWeight;
			});

			oModel.setProperty("/ChargeableWeight", iChargeableWeight);
		},
		// End of insert MS223343 - PAL-2023-004 / 007

	});
});