sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"com/globe/OneLook_CreateDTDRequest/model/Constants",
	"com/globe/OneLook_CreateDTDRequest/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
], function (BaseController, Model, Constants, Formatter, Filter, FilterOperator, JSONModel) {
	"use strict";

	/**
	 * Report controller for the object header, and table layout.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.Reports
	 */
	return BaseController.extend("com.globe.OneLook_CreateDTDRequest.controller.Report", /** @lends com.globe.OneLook_CreateDTDRequest.controller.Report */ {
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/** 
		 * Main entry point of the application. 
		 * Triggered for each route in the application lifecycle.
		 * @public
		 */
		onInit: function () {
			this._fnLoadInitModel();
			this.fnInitConfigModel();
			this.getRouter().getRoute(Constants.ROUTE_REPORT).attachPatternMatched(this.onRouteMatched, this);
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @public
		 */
		onRouteMatched: function () {
			this.setBusyDialogOff();
			this._fnRefreshBinding();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when new request button is pressed.
		 */
		onPressNewRequest: function () {
			this.fnNavigateTo(Constants.ROUTE_DASHBOARD);
		},

		/**
		 * Event handler when reference number link is pressed.
		 * @param {object} oEvent Contains the button event object.
		 */
		onPressDTDRequest: function (oEvent) {
			var oContextProp = oEvent.getSource().getBindingContext().getObject();
			var sRouteName = oContextProp.StatusId === Constants.STATUS_DRAFT || oContextProp.StatusId === Constants.STATUS_RETURNED ?
				Constants.ROUTE_EDIT_REQUEST : Constants.ROUTE_VIEW_REQUEST;

			this.fnNavigateTo(sRouteName, {
				Recnum: oContextProp.RefNo
			});
		},

		/**
		 * Clears the data in Filter Bar fields.
		 */
		onClearFilter: function () {
			var oModel = this.getView().getModel("ReportFilter");
			var oProp = oModel.getProperty("/");
			for (var oItem in oProp) {
				oProp[oItem] = null;
			}
			oModel.setProperty("/", oProp);

			// Rebind smart table
			this.byId("idSmartTableReport").rebindTable();
		},

		/**
		 * Trigger a rebind of smart table after an event click in filter bar area.
		 * @param {object} oEvent Contains the event object of control.
		 */
		onChangeFilterBar: function (oEvent) {
			// 1. Get list of required fields in filter bar control.
			var aReFields = [this.getView().byId("idRefNoFilter"), this.getView().byId("idDateSubmittedFilter")];
			var iCount = 0;

			// 2. Loop required fields to check if how many of them are not populated
			aReFields.forEach(function (oItem) {
				if (!oItem.getValue()) {
					iCount++;
				}
			});

			// 3. Show msg box error if both of the required fields are empty. Otherwise, rebind smart table.
			if (iCount > 1) {
				// Show msg box error if required fields are empty.
				this.showMsgBoxError(this.getResourceBundle().getText("FillUpReqField"));
			} else {
				// Rebind smart table
				this.byId("idSmartTableReport").rebindTable();
			}
		},

		/**
		 * Event handler to set control value state equal to 'None'.
		 * @param {object} oEvent Contains the control event object.
		 */
		onChangeFieldValue: function (oEvent) {
			var oSource = oEvent.getSource();

			if (oSource.getValue()) {
				oSource.setValueState("None");
			}
		},

		/**
		 * Trigger a rebind of smart table after a selection of icon tab bar.
		 * @param {object} oEvent Contains the event object of icon tab bar.
		 */
		onSelectTabStatus: function (oEvent) {
			var oModel = this.getView().getModel("ReportFilter");

			// 1. Clear status model
			oModel.setProperty("/Status", null);

			// 2. Set Smart table header
			this._fnSetSmartTableHeader(oEvent.getParameter("selectedItem").getProperty("text"));

			// 3. Rebind smart table
			this.byId("idSmartTableReport").rebindTable();
		},

		/**
		 * Event handler to filter data of tables according to filter criteria.
		 */
		onBeforeRebindTable: function (oEvent) {
			var oSmartTableFilter = oEvent.getParameter("bindingParams");
			var aFilters = this._fnCreateFilter();
			var sTabId = this._fnGetCurrentTab();

			// Filter status tab
			this._fnFilterStatusSearchHelp(sTabId);

			// Filter smart table
			this._fnFilterSmartTable(aFilters, oSmartTableFilter);
			//Sort smart table
			oSmartTableFilter.sorter = [
				new sap.ui.model.Sorter({
					path: "DateSubmitted",
					descending: true
				}),
				new sap.ui.model.Sorter({
					path: "RefNo",
					descending: true
				})
			];
		},

		onReportTabDataReceived: function (oEvt) {
			var oPayload = oEvt.getParameter("data");

			this.getView().setModel(new JSONModel(oPayload.results), "ReportTab");
			// var sTabId = this._fnGetCurrentTab();

			// //filter status tab
			// this._fnFilterStatusSearchHelp(sTabId);
			// this.byId("idSmartTableReport").rebindTable();
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

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Filter the 'Status' search help in filter bar area, according to the selected icon tab bar.
		 * @param {string} sKey Contains the key of selected icon tab bar.
		 * @private
		 */
		_fnFilterStatusSearchHelp: function (sKey) {
			this.byId("idSelectStatus").getBinding("items").filter(
				new Filter("StatusTab", FilterOperator.EQ, sKey)
			);
		},

		/**
		 * Load local model for tabs
		 */
		_fnLoadInitModel: function () {
			var oModelFilter = Model.createReportFilterModel();

			// this.getView().setModel(oModelTab, "ReportTab");
			// this.getView().bindElement("ReportTab>/");

			this.getView().setModel(oModelFilter, "ReportFilter");
			this.getView().bindElement("ReportFilter>/");
		},

		/**
		 * Create a filter according to the define parameters in filter bar area and selected icon tab bar.
		 * @private
		 */
		_fnCreateFilter: function () {
			var oModelProp = this.getView().getModel("ReportFilter").getProperty("/");
			var aFilters = [];

			// Reference no. value
			if (oModelProp.Recnum) {
				aFilters.push(new Filter("RefNo", FilterOperator.Contains, oModelProp.Recnum));
			}

			// Request Date value
			if (oModelProp.FromDate && oModelProp.ToDate) {
				aFilters.push(new Filter({
					filters: [
						new Filter("DateSubmitted", FilterOperator.GE, Formatter.formatUTC(oModelProp.FromDate)),
						new Filter("DateSubmitted", FilterOperator.LE, Formatter.formatUTC(oModelProp.ToDate))
					],
					and: true
				}));
			}

			// Transaction type
			if (oModelProp.TransType) {
				aFilters.push(new Filter("TransType", FilterOperator.EQ, oModelProp.TransType));
			}

			// BSS case
			if (oModelProp.BssCase) {
				aFilters.push(new Filter("BssCase", FilterOperator.Contains, oModelProp.BssCase));
			}

			// STO
			if (oModelProp.Sto) {
				aFilters.push(new Filter("Sto", FilterOperator.Contains, oModelProp.Sto));
			}

			// DeliveryOrder
			if (oModelProp.DeliveryOrder) {
				aFilters.push(new Filter("DeliveryOrder", FilterOperator.Contains, oModelProp.DeliveryOrder));
			}

			// Status
			if (oModelProp.Status) {
				aFilters.push(new Filter("StatusId", FilterOperator.EQ, oModelProp.Status));
			} else {

				// Filter for selection of tabs.
				var sTabId = this._fnGetCurrentTab();
				if (sTabId === Constants.REPORT_DEFAULT_TAB) {
					aFilters.push(
						new Filter({
							filters: [
								new Filter("StatusId", FilterOperator.EQ, Constants.REPORT_STATUS_DRAFT),
								new Filter("StatusId", FilterOperator.EQ, Constants.REPORT_STATUS_RETURNED)
							],
							and: false
						})
					);
				} else {
					aFilters.push(new Filter("StatusId", FilterOperator.EQ, sTabId));

					// TODO: Add filter here for Status Dropdown in filter bar area.
				}
				// var oReportTabModel = this.getView().getModel("ReportTab");

				// if(!oReportTabModel) { //Initial loading default tab "For Action"
				// 	aFilters.push(
				// 		new Filter({
				// 			filters: [
				// 				new Filter("StatusId", FilterOperator.EQ, Constants.REPORT_STATUS_DRAFT),
				// 				new Filter("StatusId", FilterOperator.EQ, Constants.REPORT_STATUS_RETURNED)
				// 			],
				// 			and: false
				// 		})
				// 	);
				// }else{ //else filter table based on the selected tab
				// 	var aReportTab = oReportTabModel.getData();
				// 	var aStatusFilter = [];
				// 	var aFilteredTab = aReportTab.filter(function(oReportTab){
				// 		return oReportTab.TabId === sTabId;
				// 	});
				// 	var aStatus = aFilteredTab[0].NavTo_ReportTab_Status.results;
				// 	for(var i = 0; i <= aStatus.length; i++){
				// 		if(aStatus.hasOwnProperty(i)){
				// 			aStatusFilter.push(new Filter("StatusId", FilterOperator.EQ, aStatus[i].StatusId));
				// 		}
				// 	}
				// 	if(aStatusFilter){ //Combinded status filter with OR operator
				// 		aFilters.push(new Filter({
				// 			filters: aStatusFilter,
				// 			and: false
				// 		}));	
				// 	}
				// }
			}

			// for (var sProp in oModelProp) {
			// 	if (oModelProp[sProp]) {
			// 		// Filter for filter bar are selection.
			// 		if (sProp.indexOf("FromDate") > -1) {
			// 			aFilters.push(new Filter("DateSubmitted", FilterOperator.GE, Formatter.formatUTC(oModelProp[sProp])));
			// 		} else if (sProp.indexOf("ToDate") > -1) {
			// 			aFilters.push(new Filter("DateSubmitted", FilterOperator.LE, Formatter.formatUTC(oModelProp[sProp])));
			// 		} else {
			// 			// Filter for Recnum, Status, Transaction type, BSS/STO and D/O.
			// 			aFilters.push(new Filter(sProp, FilterOperator.Contains, oModelProp[sProp]));
			// 		}
			// 	} else {
			// 		// Filter for selection of tabs.
			// 		if (sProp.indexOf("Status") > -1) {
			// 			var sTabName = this._fnGetCurrentTab();
			// 			aFilters.push(new Filter(sProp, FilterOperator.EQ, sTabName));
			// 		}
			// 	}
			// }

			return aFilters;
		},

		/**
		 * Get the current selected key of icon tab bar.
		 * @private
		 */
		_fnGetCurrentTab: function () {
			var sIconTabKey = this.byId("idIconTabFilter").getSelectedKey();
			// If icon tab key is empty, we add a default.
			var sTabName = sIconTabKey ? sIconTabKey : Constants.REPORT_DEFAULT_TAB;

			return sTabName;
		},

		// /**
		//  * Get the current selected tab description of icon tab bar.
		//  * @returns {string} Returns description of the tab
		//  * @private
		//  */
		// _fnGetCurrentTabDesc: function (sTabKey) {
		// 	var i18n = this.getResourceBundle();
		// 	var oReportTabModel = this.getView().getModel("ReportTab");
		// 	var sTabDescription = "";

		// 	if (!oReportTabModel) {
		// 		//If oReportTabModel is Empty provide default tab
		// 		sTabDescription = i18n.getText("ReportTabForAction");
		// 	} else {
		// 		var aReportTab = oReportTabModel.getData();
		// 		aReportTab.forEach(function (oReportTab) {
		// 			if (oReportTab.TabId === sTabKey) {
		// 				sTabDescription = oReportTab.TabDesc;
		// 				return;
		// 			}
		// 		});
		// 	}
		// 	return sTabDescription;
		// },

		/**
		 * Method for creating a filter to smart table.
		 * @param {array} aFilters Contains array of sap.ui.model.Filter
		 * @param {object} oSmartTableFilter Contains the instance of Smart Table.
		 * @private
		 */
		_fnFilterSmartTable: function (aFilters, oSmartTableFilter) {
			if (aFilters.length > 0) {
				oSmartTableFilter.filters.push(
					new Filter({
						filters: aFilters,
						and: true
					})
				);
			}
		},

		/**
		 * Refresh binding and set of initial header name for smart table.
		 * @private
		 */
		_fnRefreshBinding: function () {
			// Refresh smart table of current tab.
			this.byId("idSmartTableReport").rebindTable();
			// Set Smart table header
			this._fnSetSmartTableHeader(this.getResourceBundle().getText("ReportTabForAction"));
		},

		/**
		 * Set smart table header name.
		 * @param {string} sTabDesc Contains description of smart table header name
		 * @private
		 */
		_fnSetSmartTableHeader: function (sTabDesc) {
			this.byId("idSmartTableReport").setHeader(sTabDesc);
		}
	});
});