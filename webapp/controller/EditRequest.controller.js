sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"com/globe/OneLook_CreateDTDRequest/model/Constants",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (BaseController, Constants, Model, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	/**
	 * Edit Request controller for the object header, and table layout.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author - Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.EditRequest
	 */
	return BaseController.extend("com.globe.OneLook_CreateDTDRequest.controller.EditRequest", /** @lends com.globe.OneLook_CreateDTDRequest.controller.EditRequest */ {
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/** 
		 * Main entry point of the application. 
		 * Triggered for each route in the application lifecycle.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute(Constants.ROUTE_EDIT_REQUEST).attachPatternMatched(this.onRouteMatched, this);

			this.fnInitMessageManager();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @public
		 */
		onRouteMatched: function (oEvt) {
			var oArgs = oEvt.getParameter("arguments");
			this._refno = oArgs.Recnum;
			this.fnAttachedDefferedModel();
			this.setBusyDialogOff();

			this.getView().getModel().metadataLoaded().then(function () {
				this._path = "/" + this._fnCreateOLHeaderKey();
				this._bindView(this._path);
				this._createMaintenanceEnties();
				this.onPrevious();
			}.bind(this));

			this.fnRemoveMessageManager();
		},

		/**
		 * Event handler when Show details/Hide deatils is clicked
		 * toggle display of the items
		 * @param {object} oEvent Contains the event object.
		 * @public
		 */
		onTogglePackageDetails: function (oEvent) {
			var sPath = this.fnGetBindingContext(oEvent.getSource()).getPath();
			var bShowDetails = this._editRequestModel.getProperty(sPath + "/bShowDetails");

			this._editRequestModel.setProperty(sPath + "/bShowDetails", !bShowDetails);
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
		 * Opens a url to download the attachment.
		 * @param {object} oEvent Contains the event object of Link.
		 */
		onOpenAttachment: function (oEvent) {
			var oSource = oEvent.getSource();
			var oContextModel = this.fnGetBindingContext(oSource);
			var oContextProp = oContextModel.getObject();
			var sServiceURL = this.getView().getModel().sServiceUrl;
			var sKey = this._fnCreateFileKey(oContextProp, "AttachmentSet");
			var sServiceFile = sServiceURL.concat("/", sKey, "/$value");

			sap.m.URLHelper.redirect(sServiceFile, false);
		},

		/**
		 * Event handler when cancel is clicked
		 * @param {object} oEvent Contains the link event object.
		 * @public
		 */
		onCancel: function () {
			if (!this.oCancelRequest) {
				this.oCancelRequest = sap.ui.xmlfragment(
					this.getView().getId(), "com.globe.OneLook_CreateDTDRequest.fragment.Dialog.CancelRecord", this);
				this.getView().addDependent(this.oCancelRequest);
			}
			this.oCancelRequest.open();
		},

		onProceedCancel: function () {
			this.oCancelRequest.close();
			//proceed on deleting request
			this.fnRequestDeleteDTD({
					RefNo: this._refno
				})
				.then(this.setBusyDialogOn.bind(this))
				.then(this.fnSubmitRequests.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this.setBusyDialogOff.bind(this))
				.then(this.showDialog.bind(this, {
					msg: this.getResourceBundle().getText("successCancelledText", [this._refno]),
					title: this.getResourceBundle().getText("successCancelled")
				}))
				.then(this.fnNavigateTo.bind(this, Constants.ROUTE_REPORT))
				.catch(this.fnCatchError.bind(this));
		},

		/**
		 * Event handler when cancel button is clicked from the dialog
		 * @public
		 */
		onCloseDialog: function () {
			this.oCancelRequest.close();
		},

		/**
		 * Event hanndler when previous button is clicked.
		 * @public
		 */
		onPrevious: function () {
			var oNavContainer = this.byId("EditContainer");
			oNavContainer.backToPage(this.getView().byId("editDynamicPage"));

			// Remove message manager.
			// this.fnRemoveMessageManager();
		},

		/*
		 * Event handler when Item Type was change
		 * @params {object} oEvent Contains the button event object.
		 * @public
		 */
		onItemTypeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			var sPath = this.fnGetBindingContext(oSource).getPath();

			this._editRequestModel.setProperty(sPath + "/ItemTypeDesc", oSelectedItem.getText());
			this._fnValidateFields(oEvent.getSource());
		},

		/*
		 * Event handler when Material Type was change
		 * @params {object} oEvent Contains the button event object.
		 * @public
		 */
		onMaterialTypeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			var sPath = this.fnGetBindingContext(oSource).getPath();

			this._editRequestModel.setProperty(sPath + "/MaterialTypeDesc", oSelectedItem.getText());
			this._fnValidateFields(oEvent.getSource());
		},

		/**
		 * Event handler when Add Package button is clicked
		 * @public
		 */
		onAddPackage: function () {
			var aNavItems = this._editRequestModel.getProperty("/NAV_OLHeader_Item");

			// 1. Push data to package line items and update model.
			aNavItems.push(Model.createItemsModel(this.getResourceBundle(), aNavItems.length + 1,
				this._viewModel.getProperty("/MinDate")));
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aNavItems);
			this._editRequestModel.refresh(true);

			// 2. Update view model.
			this._viewModel.setProperty("/PackageCount", aNavItems.length);
		},

		/*
		 * Event handler when delete button is clicked
		 * @params {object} oEvent Contains the button event object.
		 * @public
		 */
		onDeleteItem: function (oEvent) {
			var oContextObject = this.fnGetBindingContext(oEvent.getSource()).getObject();
			// 1. Filter the package item by package no and update its package no. title.
			var aResultItem = this._editRequestModel.getProperty("/NAV_OLHeader_Item").filter(function (oItem) {
				return oItem.PackageNo !== oContextObject.PackageNo;
			});
			this._fnUpdatePackageTitle(aResultItem);

			// 2. Update edit model line item and refresh.
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aResultItem);
			this._editRequestModel.refresh(true);

			// 3. Update view model and display a message toast.
			this._viewModel.setProperty("/PackageCount", this._editRequestModel.getProperty("/NAV_OLHeader_Item").length);
			MessageToast.show(this.getResourceBundle().getText("PackageDeleted"));

			// 4. Re-compute total estimated cost.
			this._fnComputeTotalEstimatedCost();

			// 5 . Add to delete maintenance queue
			if (this._fnCheckItemExistInServer(oContextObject)) {
				this._aDeletePackageItems.push(oContextObject);
			}
		},

		/*
		 * Event handler to copy pickup/delivery details entered from other package
		 * @param {object} oEvent Contains the comnbo box event object.
		 * @public
		 */
		onCopyDetails: function (oEvent) {
			var oSource = oEvent.getSource();
			var sSelectedPath = this.fnGetBindingContext(oSource.getSelectedItem()).getPath();
			var sPath = this.fnGetBindingContext(oSource).getPath();
			var sAddressType = oSource.data("DetailInfo");

			this._onCopyDetails(sSelectedPath, sPath, sAddressType);
		},

		/*
		 * Event handler when WBS/Cost Center Code was change
		 * Validatess  if either WBS or Cost Center code was populated
		 * @public
		 */
		onCodeChange: function (oEvt) {
			this.validateCode();
		},

		/*
		 * Event handler when delivery type value was change
		 * @param {object} oEvent Contains the comnbo box event object.
		 * @public
		 */
		onDeliveryTypeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002

			this._editRequestModel.setProperty(sPath + "/DeliveryTypeDesc", oSelectedItem.getText());

			// Start of insert MS223343 - PAL-2023-010
			var i18n = this.getResourceBundle();
			if (this._editRequestModel.getProperty(sPath + "/TransportMode") === "AIR" && oSelectedItem.getKey() === "LE") {
				MessageToast.show(i18n.getText("errorDelivType"));
				this._editRequestModel.setProperty(sPath + "/DeliveryType", "");
				this._editRequestModel.setProperty(sPath + "/DeliveryTypeDesc", "");
			}
			// Start of insert MS223343 - PAL-2023-010

			this._fnValidateFields(oEvent.getSource());
		},

		/*
		 * Event handler when mode of transport was changed and popultae description
		 * @param {object} oEvent Contains the comnbo box event object.
		 * @public
		 */
		onTransportModeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			var aFields = ["ContainerType", "ContainerTypeDesc"];
			// End of edit MS223343 - PAL-2023-002

			//1. update description field
			this._editRequestModel.setProperty(sPath + "/TransportModeDesc", oSelectedItem.getText());

			// Start of insert MS223343 - PAL-2023-002
			// Filter Delivery Type
			// Start of change MS223343 - PAL-2023-010
			if (oSelectedItem.getKey() === "SEA" || oSelectedItem.getKey() === "RORO" || oSelectedItem.getKey() === "RORT") {
				this._editRequestModel.setProperty(sPath + "/DeliveryType", "N");
				this._editRequestModel.setProperty(sPath + "/DeliveryTypeDesc", "Normal");
			}
			// End of change MS223343 - PAL-2023-010
			// End of insert MS223343 - PAL-2023-002

			//2. validate field
			this._fnValidateFields(oSource);
			// 3. Clear fields
			for (var i = 0; i < aFields.length; i++) {
				this._editRequestModel.setProperty(sPath + "/" + aFields[i], "");
			}
		},

		// Start of insert MS223343 - PAL-2023-002
		/**
		 * Event handler to clear selected Manpower when switch to false.
		 * @private
		 */
		onManpowerChange: function (oEvent) {
			var oParam = oEvent.getParameters();
			var sPath = "/NAV_OLHeader_Item/0";

			if (!oParam.state) {
				this._editRequestModel.setProperty(sPath + "/Manpower", "");
			}
		},

		/**
		 * Event handler to clear selected Crate when switch to false.
		 * @private
		 */
		onCrateChange: function (oEvent) {
			var oParam = oEvent.getParameters();
			var sPath = "/NAV_OLHeader_Item/0";

			if (!oParam.state) {
				this._editRequestModel.setProperty(sPath + "/Crate", "");
			}
		},

		_fnValidateTruckType: function () {
			var oContext = this;
			var aItem = this._editRequestModel.getProperty("/NAV_OLHeader_Item");
			var iTotalWeight = 0;
			var iTotalVolumeMetricWeight = 0;
			var bTruckTypeVisibility = false;
			var sTransportMode = "";

			aItem.forEach(function (oItem) {
				sTransportMode = oItem.TransportMode;
				iTotalWeight = iTotalWeight + parseFloat(oItem.Weight);
				iTotalVolumeMetricWeight = iTotalVolumeMetricWeight + oContext.formatter.formatVolumeMetricWeight(oItem.Length, oItem.Width,
					oItem.Height);
			});

			if (sTransportMode === "LAND" && (iTotalWeight > 200 || iTotalVolumeMetricWeight > 200)) {
				bTruckTypeVisibility = true;
			}

			// Start of delete MS223343 - PAL-2023-004 / 007
			// if (sTransportMode === "RORO" && (iTotalWeight > 5000 || iTotalVolumeMetricWeight > 5000)) {
			// 	bTruckTypeVisibility = true;
			// }
			// End of delete MS223343 - PAL-2023-004 / 007

			// Start of insert MS223343 - PAL-2023-004 / 007
			if (sTransportMode === "RORT") {
				bTruckTypeVisibility = true;
			}
			// End of insert MS223343 - PAL-2023-004 / 007

			this._editRequestModel.setProperty("/TruckTypeVisibility", bTruckTypeVisibility);
		},
		// End of insert MS223343 - PAL-2023-002

		/*
		 * Event handler when trucktype was changed and popultae description
		 * @public
		 */
		// Start of edit MS223343 - PAL-2023-002
		onTruckTypeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var sPath = "/NAV_OLHeader_Item/0";
			var oSelectedItem = oSource.getSelectedItem();
			this._editRequestModel.setProperty(sPath + "/TruckTypeDesc", oSelectedItem.getText());
			this._editRequestModel.setProperty(sPath + "/Courier", "");

			var aItems = this.fnCopyItemDetails(this._editRequestModel.getProperty("/NAV_OLHeader_Item"));
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aItems);

			if (this.getView().getModel("UserType").getProperty("/UserType") === "PA" || this._editRequestModel.getProperty("/TransType") ===
				"DT") {
				this._fnValidateFields(oEvt.getSource());
			} else {
				this.setBusyDialogOn();
				this.fnRequestFreightCost(this._editRequestModel.getProperty("/NAV_OLHeader_Item"), this._editRequestModel.getProperty("/"))
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessFreightCost.bind(this))
					.then(this._fnProcessFreightCost.bind(this))
					.then(this._fnComputeTotalEstimatedCost.bind(this))
					.then(this._fnValidateFields.bind(this, oEvt.getSource()))
					.then(this.setBusyDialogOff.bind(this))
					.catch(this.fnCatchError.bind(this));
			}
		},

		onCourierChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var oSelectedItem = oSource.getSelectedItem();

			var aItems = this.fnCopyItemDetails(this._editRequestModel.getProperty("/NAV_OLHeader_Item"));
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aItems);

			this.setBusyDialogOn();
			this.fnRequestFreightCost(this._editRequestModel.getProperty("/NAV_OLHeader_Item"), this._editRequestModel.getProperty("/"))
				.then(this.fnSubmitRequests.bind(this))
				.then(this.fnSuccessFreightCost.bind(this))
				.then(this._fnProcessFreightCost.bind(this))
				.then(this._fnComputeTotalEstimatedCost.bind(this))
				.then(this._fnValidateFields.bind(this, oEvt.getSource()))
				.then(this.setBusyDialogOff.bind(this))
				.catch(this.fnCatchError.bind(this));
		},
		// End of edit MS223343 - PAL-2023-002

		/*
		 * Event handler when trucktype was changed and popultae description
		 * @param {object} oEvent Contains the comnbo box event object.
		 * @public
		 */
		onContainerTypeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";

			this._editRequestModel.setProperty(sPath + "/ContainerTypeDesc", oSelectedItem.getText());
			this._editRequestModel.setProperty(sPath + "/Courier", "");
			// End of edit MS223343 - PAL-2023-002

			// Start of insert MS223343 - PAL-2023-002
			var aItems = this.fnCopyItemDetails(this._editRequestModel.getProperty("/NAV_OLHeader_Item"));
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aItems);

			if (this.getView().getModel("UserType").getProperty("/UserType") === "PA" || this._editRequestModel.getProperty("/TransType") ===
				"DT") {
				this._fnValidateFields(oEvt.getSource());
			} else {
				this.setBusyDialogOn();
				this.fnRequestFreightCost(this._editRequestModel.getProperty("/NAV_OLHeader_Item"), this._editRequestModel.getProperty("/"))
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessFreightCost.bind(this))
					.then(this._fnProcessFreightCost.bind(this))
					.then(this._fnComputeTotalEstimatedCost.bind(this))
					.then(this._fnValidateFields.bind(this, oEvt.getSource()))
					.then(this.setBusyDialogOff.bind(this))
					.catch(this.fnCatchError.bind(this));
			}
			// End of insert MS223343 - PAL-2023-002
		},

		/**
		 * Event handler when Company was changed
		 * @param {object} oEvent Contains the comnbo box event object.
		 * @public
		 */
		onCompanyChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oSelectedItem = oSource.getSelectedItem();

			this._editRequestModel.setProperty("/CompanyDesc", oSelectedItem.getProperty("text"));
			// Start of insert - MS223343 - PAL-2023-003
			this._editRequestModel.setProperty("/CostCenter", "");
			var oModel = this.getView().getModel("MasterData");
			if (oModel.getProperty("/costCenterNode")) {
				oModel.setProperty("/costCenterNode", "");
			}
			// End of insert - MS223343 - PAL-2023-003
			this._fnValidateFields(oEvent.getSource());
		},

		// Start of edit MS223343 - PAL-2023-002
		/*
		 * Event handler when pickup/Delivery location was changed.
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onLocationChange: function (oEvent) {
			var oSource = oEvent.getSource();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oSource.getSelectedItem();
			var sLocation = oSource.data("DetailInfo");
			var aFields = ["Area", "Province", "ProvinceDesc", "City", "CityDesc", "Barangay", "BarangayDesc",
				"UnitNo", "HouseNo", "Subdivision", "Street", "Location", "LocationDesc", "Zipcode", "SpecLoc", "ContactPerson", "ContactNumber",
				"ContactEmail"
			];

			this._fnUpdateDescField(sPath, sLocation, "OriginDesc", oSelectedItem.getText());
			this._fnValidateFields(oEvent.getSource());
			this._fnClearAddressFields(sPath, sLocation, aFields);
		},
		// End of edit MS223343 - PAL-2023-002

		/*
		 * Event handler when specific location was changed and populate list of province
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onSpecLocChange: function (oEvent) {
			var oSource = this._oInputAddress;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002
			var sLocation = oSource.data("DetailInfo");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oDetails = oSelectedItem.data("location");

			this._fnUpdateDescField(sPath, sLocation, "Location", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sLocation, "LocationDesc", oSelectedItem.getTitle());
			this._fnValidateFields(oSource);
			this._fnPopulateAddress(oDetails, sPath, sLocation);
		},

		/*
		 * Event handler when region was changed and populate list of province
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAreaChange: function (oEvent) {
			var oSource = oEvent.getSource();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oSource.getSelectedItem();
			var sSelectedKey = oSource.getSelectedKey();
			var sLocation = oSource.data("DetailInfo");
			var aFields = ["Province", "ProvinceDesc", "City", "CityDesc", "Barangay", "BarangayDesc", "Zipcode"];
			var aFilters = [];
			aFilters.push(new Filter("Area", FilterOperator.EQ, sSelectedKey));

			this._fnUpdateDescField(sPath, sLocation, "AreaDesc", oSelectedItem.getText());
			this._fnValidateFields(oSource);
			this._fnClearAddressFields(sPath, sLocation, aFields);
		},

		/*
		 * Event handler when province was changed and populate list of cities
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAddProvince: function (oEvent) {
			var oSource = this._oInputProvince;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sLocation = oSource.data("DetailInfo");
			var aFields = ["City", "CityDesc", "Barangay", "BarangayDesc", "Zipcode"];

			this._fnUpdateDescField(sPath, sLocation, "Province", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sLocation, "ProvinceDesc", oSelectedItem.getTitle());
			this._fnValidateFields(oSource);
			this._fnClearAddressFields(sPath, sLocation, aFields);
		},

		/*
		 * Event handler when city was changed and populate list of barangay
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAddCity: function (oEvent) {
			var oSource = this._oInputCity;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sLocation = oSource.data("DetailInfo");
			var aFields = ["Barangay", "BarangayDesc", "Zipcode"];

			this._fnUpdateDescField(sPath, sLocation, "City", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sLocation, "CityDesc", oSelectedItem.getTitle());
			this._fnValidateFields(oSource);
			this._fnClearAddressFields(sPath, sLocation, aFields);
		},

		/*
		 * Event handler when barangay was changed and populate list zipcode
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAddBrgy: function (oEvent) {
			var oSource = this._oInputBrgy;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = this.fnGetBindingContext(oSource).getPath();
			var sPath = "/NAV_OLHeader_Item/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sLocation = oSource.data("DetailInfo");
			var sZipCode = oSelectedItem.data("zipcode");

			this._fnUpdateDescField(sPath, sLocation, "Barangay", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sLocation, "BarangayDesc", oSelectedItem.getTitle());
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Zipcode", sZipCode);
			this._fnValidateFields(oSource);
		},

		/**
		 * Event handler when segment order was changed
		 * opens a table select dialog for channels
		 * @public
		 */
		onValueHelpSegmentOrder: function () {
			if (!this._oChannel) {
				this._oChannel = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.SegmentOrderChannel", this);
				this.getView().addDependent(this._oChannel);
			}
			this._oChannel.open();
		},

		/**
		 * Event handler when selecting a channel in the select table dialog
		 * @params {object} oEvent Contains list item event object.
		 * @public
		 */
		onSelectSegmentOrder: function (oEvent) {
			var oContext = oEvent.getParameter("selectedContexts")[0];
			var oView = this.getView();
			var aInputs = [oView.byId("SegmentOderInput"), oView.byId("SegmentOrderTypeInput"), oView.byId("ActivityInput")];
			this._editRequestModel.setProperty("/Activity", oContext.getObject().ActivityDesc);
			this._editRequestModel.setProperty("/SegmentOrderType", oContext.getObject().SegmentType);
			this._editRequestModel.setProperty("/SegmentOrder", oContext.getObject().SegmentOrder);
			this._editRequestModel.setProperty("/ChannelId", oContext.getObject().ChannelId);
			this._editRequestModel.refresh(true);

			oEvent.getSource().getBinding("items").filter([]); //clear filter

			//check fields
			aInputs.forEach(function (oInput) {
				this._fnValidateFields(oInput);
			}.bind(this));
		},

		/**
		 * Event handler whe searching in the channel select table dialog
		 * @params {object} oEvent Contains searchfield event object.
		 * @public
		 */
		onSearchSegmentOrder: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getSource().getBinding("items");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new sap.ui.model.Filter("SegmentOrder", sap.ui.model.FilterOperator.StartsWith, sValue));
			}
			oBinding.filter(aFilter);
		},

		/*
		 * Event handler field value was change
		 * @public
		 */
		onValueChange: function (oEvt) {
			var oControl = oEvt.getSource();
			this._fnValidateFields(oControl);
		},

		/**
		 * Event handler when payment is selected
		 * @param {object} oEvent Contains event object of radio button
		 */
		onSelectPayment: function (oEvt) {
			var oSource = oEvt.getSource();
			var oSelectedItem = oSource.getSelectedButton();
			var sPaymentType = oSelectedItem.data("Payment");

			if (sPaymentType === Constants.PAYMENT_MODE_OTH) {
				this._editRequestModel.setProperty("/Cashout", Constants.CASHOUT_DEFAULT_VALUE);
			}

			this._editRequestModel.setProperty("/PaymentMode", oSelectedItem.data("Payment"));
			this._editRequestModel.setProperty("/PaymentModeDesc", oSelectedItem.getText());
		},

		/*
		 * Event handler when next button is clicked.
		 * @public
		 */
		onPressNext: function () {
			var aPackageItem = this._editRequestModel.getProperty("/NAV_OLHeader_Item");
			var oDynamicForm = this.getView().byId("editPackageContent");
			var sTransactionType = this._viewModel.getProperty("/TransactionType");
			// 1. Validate fields
			var bFormValidationError = this.fnValidateRequiredFields(oDynamicForm, sTransactionType);
			var i18n = this.getResourceBundle();

			// 2. if there is no error in the form validation, proceed with validating serviceable area and SLA.
			if (!bFormValidationError) {
				this.setBusyDialogOn();
				// Start of edit MS223343 - PAL-2023-002
				aPackageItem = this.fnCopyItemDetails(aPackageItem);
				this._fnValidateTruckType();
				// Start of insert MS223343 - PAL-2023-004 / 007
				this.fnComputeChargeableWeight(this.getView().getModel("MasterData"), aPackageItem);
				// End of insert MS223343 - PAL-2023-004 / 007
				// if (this._editRequestModel.getProperty("/TruckTypeVisibility") || aPackageItem[0].TransportMode === "SEA") {
				// 	this._fnValidateDeliveryAddress()
				// 		.then(this.fnCheckCouriers.bind(this, aPackageItem))
				// 		.then(this.fnSubmitRequests.bind(this))
				// 		.then(this.fnSuccessCouriers.bind(this))
				// 		.then(this._fnProcessCouriers.bind(this))
				// 		.then(this._fnNavigateToReviewPage.bind(this, sTransactionType)) //no errors, can proceed  to next page
				// 		.then(this.setBusyDialogOff.bind(this))
				// 		.catch(this.fnCatchError.bind(this));
				// } else {
				// Start of insert - MS223343 - PAL-2023-003
				var aFilter = [];
				aFilter.push(new sap.ui.model.Filter("Kostl", FilterOperator.EQ, this._editRequestModel.getProperty("/CostCenter")));
				aFilter.push(new Filter("CompanyCode", FilterOperator.EQ, this._editRequestModel.getProperty("/CompanyCode")));
				// End of insert - MS223343 - PAL-2023-003
				this._fnValidateDeliveryAddress()
					.then(this.fnCheckCouriers.bind(this, aPackageItem))
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessCouriers.bind(this))
					.then(this._fnProcessCouriers.bind(this))
					.then(this.fnRequestFreightCost.bind(this, aPackageItem, this._editRequestModel.getProperty("/")))
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessFreightCost.bind(this))
					.then(this._fnProcessFreightCost.bind(this))
					.then(this._fnComputeTotalEstimatedCost.bind(this))
					// Start of insert - MS223343 - PAL-2023-003
					.then(this.fnReadValueHelp.bind(this, "/ZSSD_COST_CENTER_NODESet", aFilter))
					.then(this._fnSuccessCostCenterNode.bind(this))
					// End of insert - MS223343 - PAL-2023-003
					.then(this._fnNavigateToReviewPage.bind(this, sTransactionType)) //no errors, can proceed  to next page
					.then(this.setBusyDialogOff.bind(this))
					.catch(this.fnCatchWarningError.bind(this));
				// }
				// End of edit MS223343 - PAL-2023-002
			} else {
				this.showMsgBoxError(i18n.getText("ValidationError"));
			}
		},

		/**
		 * Event handler after selecting a file in file uploader control
		 * @param {object} oEvent Contains event object of file uploader.
		 */
		onFileSelect: function (oEvent) {
			var aAttachmentList = this._editRequestModel.getProperty("/NAV_OLHeader_Attachment");
			var oFile = oEvent.getParameter("files")[0];
			var iIndexFound = -1;
			if (oFile) {
				var oData = {
					FileName: oFile.name,
					file: oFile,
					FileSize: oFile.size,
					MimeType: oFile.type,
					Icon: this.formatter.fnFormatFileIcon(oFile.type)
				};
				// Check if file is existing in local model.
				aAttachmentList.forEach(function (oItem, iIdx) {
					if (oItem.FileName === oData.FileName) {
						iIndexFound = iIdx;
						return;
					}
				});
				// If file is existing, replace the file. Otherwise, push to array.
				if (iIndexFound > -1) {
					this.showMsgBoxConfirm(this.getResourceBundle().getText("confirmReplaceFile", [oData.FileName]))
						.then(function () {
							var aDeletedItem = aAttachmentList.splice(iIndexFound, 1, oData);
							this._editRequestModel.refresh(true);

							// Add to delete maintenance queue
							if (this._fnCheckFileExistInServer(aDeletedItem[0])) {
								this._aDeleteFileMaint.push(aDeletedItem[0]);
							}
						}.bind(this));
				} else {
					aAttachmentList.push(oData);
					this._editRequestModel.refresh(true);
				}
			}
		},

		/**
		 * Event handler when delete item is clicked in attachment section.
		 * @param {object} oEvent Contains event object of Custom List Item delete button.
		 */
		onFileDeleted: function (oEvent) {
			var oListItem = oEvent.getParameter("listItem");
			var iIndexOfItem = this.byId("idAttachmentList").indexOfItem(oListItem);
			var sPath = oListItem.getBindingContextPath();
			var oProp = this._editRequestModel.getProperty("/");
			var oItem = this._editRequestModel.getProperty(sPath);

			this.showMsgBoxConfirm(this.getResourceBundle().getText("confirmDeleteFile", [oItem.FileName]))
				.then(function () {
					var aDeletedItem = oProp.NAV_OLHeader_Attachment.splice(iIndexOfItem, 1);
					this._editRequestModel.setProperty("/", oProp);
					this._editRequestModel.refresh(true);

					// Add to delete maintenance queue
					if (this._fnCheckFileExistInServer(aDeletedItem[0])) {
						this._aDeleteFileMaint.push(aDeletedItem[0]);
					}
				}.bind(this));
		},

		/**
		 * Event handler when submit/save as draft is clicked
		 * @public
		 */
		onSave: function (oEvt) {
			var oDynamicForm = this.getView().byId("ReviewPackageContent");
			var sTransactionType = this.getView().getModel("viewModel").getProperty("/TransactionType");
			this._isDraft = oEvt.getSource().data("SaveType") === Constants.SAVE_DRAFT ? true : false;

			// Start of insert MS223343 - PAL-2023-002
			var aItems = this.fnCopyItemDetails(this._editRequestModel.getProperty("/NAV_OLHeader_Item"));
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aItems);
			// End of insert MS223343 - PAL-2023-002

			this._fnValidateRequiredFields(oDynamicForm, sTransactionType, this._isDraft)
				.then(this.setBusyDialogOn.bind(this))
				.then(this._fnRequestHeader.bind(this))
				.then(this._fnRequestPackageLineItem.bind(this))
				.then(this._fnRequestFileLineItem.bind(this))
				.then(this.fnSubmitRequests.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this._fnRequestSubmit.bind(this))
				.then(this._fnProcessSuccess.bind(this))
				.catch(this.fnCatchError.bind(this));
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Get the binding context
		 * @param {object} oSource Contains the source control.
		 * @public
		 */
		fnGetBindingContext: function (oSource) {
			return oSource.getBindingContext("editOLRequest");
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
				"NAV_OLHeader_ProcessNode",
				"NAV_OLHeader_ProcessLane"
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
						// Set busy dialog off after loading of master data
						// oContext.setBusyDialogOff();
						oContext._fnProcessDataReceived(oEvent);
					}
				}
			});
		},

		/**
		 * Initializes masterdata
		 * @private
		 */
		_initMasterData: function () {
			var sTransType = this._viewModel.getProperty("/TransactionType");
			this.getView().setModel(new JSONModel({}), "MasterData");
			this.getModel("MasterData").refresh(true);
			this.oMasterModel = this.getView().getModel("ZSSD_ONELOOK_MDATA_SRV");

			this._initItemType(sTransType);
			this._initModeOfTransport(sTransType);
		},

		/*
		 * function to update Package titles
		 */
		_fnUpdatePackageTitle: function (aItems) {
			var i18n = this.getResourceBundle();
			for (var i = 0; i <= aItems.length; i++) {
				if (aItems.hasOwnProperty(i)) {
					aItems[i].PackageNo = i18n.getText("PackageNoTtl", i + 1);
				}
			}
		},

		/**
		 * Initializes itemType Masterdata
		 * @param {string} sTransType Contains type of transaction
		 * @private
		 */
		_initItemType: function (sTransType) {
			var aFilter = [];
			aFilter.push(new Filter("TransType", FilterOperator.EQ, sTransType));

			this.fnReadValueHelp("/ZSSD_ITEM_TYPESet", aFilter)
				.then(this._fnSuccessItemType.bind(this))
				.then(this.setBusyDialogOff.bind(this))
				.catch(this.fnCatchError.bind(this));
		},

		/**
		 * Initializes itemType Masterdata
		 * @param {Object} oData Contains the data returned by the service
		 * @private
		 */
		_fnSuccessItemType: function (oData) {
			this.getView().getModel("MasterData").setProperty("/itemType", oData.results);
			return Promise.resolve();
		},

		/**
		 * Initializes Mode of transport masterdata
		 * @param {string} sTransType Contains type of transaction
		 * @private
		 */
		_initModeOfTransport: function (sTransType) {
			var oLocalMasterData = this.getView().getModel("LocalMasterData").getData();
			var aTransportMode = oLocalMasterData.ModeOfTransport.filter(function (oTransportMode) {
				return oTransportMode.TransType === sTransType;
			});

			this.getView().getModel("MasterData").setProperty("/ModeOfTransport", aTransportMode);
		},

		/**
		 * Initializes all view model
		 * @param {String} sRequestType constains the transaction type of the request
		 * @param {String} sAccountType Contains the Account type for trade request
		 * @private
		 */
		_initializeViewModel: function (sRequestType, sAccountType, oParam) {
			this._setItemData(oParam);
			this._setViewModel(sRequestType, sAccountType, oParam);
		},

		/**
		 * Initializes item model
		 * @param {object} oParam Contains recevied data from bind element.
		 * @private
		 */
		_setItemData: function (oParam) {
			this._editRequestModel = new JSONModel(oParam);
			this.getView().setModel(this._editRequestModel, "editOLRequest");
			this.getView().bindElement("editOLRequest>/");
		},

		/**
		 * Create view config model.
		 * @param {string} sRequestType Contains the transaction type.
		 * @param {string} sAccountType Contains the Account type for trade request.
		 * @param {object} oParam Contains the object of request.
		 * @private
		 */
		_setViewModel: function (sRequestType, sAccountType, oParam) {
			this._viewModel = Model.createViewModel(sRequestType, sAccountType, oParam.StatusId);
			this.getView().setModel(this._viewModel, "viewModel");

			// Update package count
			this._viewModel.setProperty("/PackageCount", this._editRequestModel.getProperty("/NAV_OLHeader_Item").length);
		},

		/**
		 * Updates description fields
		 * @param {String} sPath contains the item path
		 * @param {String} sLocation contains the path for loacation
		 * @param {String} sFieldName contains the field name to update
		 * @param {String) sValue contains the updated value
		 * @private
		 */
		_fnUpdateDescField: function (sPath, sLocation, sFieldName, sValue) {
			this._editRequestModel.setProperty(sPath + "/" + (sLocation + sFieldName), sValue);
		},

		/**
		 * Updates value helps list
		 * @param {String} sPath contains the item path
		 * @param {String} sLocation contains the path for loacation
		 * @param {String} sValueHelpField contains the name of the field with valuehelp
		 * @param {Object} oData Contains data returned by the service
		 * @private
		 */
		_fnUpdateItemValueHelp: function (sPath, sLocation, sValueHelpField, oData) {
			this._editRequestModel.getProperty(sPath).ValueHelps[sLocation][sValueHelpField] = oData.results;
			this._editRequestModel.refresh(true);

			return Promise.resolve();
		},

		/*
		 * Populate address and contact details from the selected location
		 * @param {String} sPath contains the item path
		 * @param {String} sLocation contains the path for loacation
		 * @param {Array} aItemData contains the details of the pakcages
		 * @param {object} Return promisse solve with empty parameter
		 * @private
		 */
		_fnPopulateAddress: function (oDetails, sPath, sLocation) {
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "UnitNo", oDetails.UnitNum);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "HouseNo", oDetails.HouseNum);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Street", oDetails.Street);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Subdivision", oDetails.Subdivision);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Area", oDetails.Area);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "ProvinceDesc", oDetails.ProvinceDesc);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "CityDesc", oDetails.CityDesc);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "BarangayDesc", oDetails.BarangayDesc);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Province", oDetails.ProvinceCode);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "City", oDetails.CityCode);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Barangay", oDetails.Barangay);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "Zipcode", oDetails.ZipCode);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "ContactPerson", oDetails.ContactPerson);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "ContactNumber", oDetails.ContactNumber);
			this._editRequestModel.setProperty(sPath + "/" + sLocation + "ContactEmail", oDetails.ContactEmail);

			return Promise.resolve({
				aItemData: this._editRequestModel,
				sPath: sPath,
				sLocation: sLocation
			});
		},

		/**
		 * Copy datails from selected package
		 * @param {string} sPathFrom Contains path of the package to be copied
		 * @param {string} sPathTo Contains path of the package the details to be copied to
		 * @param {string} sAddressType Contains the location details
		 * @private
		 */
		_onCopyDetails: function (sPathFrom, sPathTo, sAddressType) {
			var oCopyFrom = this._editRequestModel.getProperty(sPathFrom);

			// 1. Update address fields: Pickup or Delivery.
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Origin", oCopyFrom[sAddressType + "Origin"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "OriginDesc", oCopyFrom[sAddressType + "OriginDesc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Location", oCopyFrom[sAddressType + "Location"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "LocationDesc", oCopyFrom[sAddressType + "LocationDesc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "UnitNo", oCopyFrom[sAddressType + "UnitNo"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "HouseNo", oCopyFrom[sAddressType + "HouseNo"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Street", oCopyFrom[sAddressType + "Street"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Subdivision", oCopyFrom[sAddressType + "Subdivision"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Area", oCopyFrom[sAddressType + "Area"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "AreaDesc", oCopyFrom[sAddressType + "AreaDesc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Province", oCopyFrom[sAddressType + "Province"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "ProvinceDesc", oCopyFrom[sAddressType + "ProvinceDesc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "City", oCopyFrom[sAddressType + "City"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "CityDesc", oCopyFrom[sAddressType + "CityDesc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Barangay", oCopyFrom[sAddressType + "Barangay"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "BarangayDesc", oCopyFrom[sAddressType + "BarangayDesc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Zipcode", oCopyFrom[sAddressType + "Zipcode"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "PickupSpecLoc", oCopyFrom[sAddressType + "PickupSpecLoc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "DeliverySpecLoc", oCopyFrom[sAddressType + "DeliverySpecLoc"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "ContactPerson", oCopyFrom[sAddressType + "ContactPerson"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "ContactNumber", oCopyFrom[sAddressType + "ContactNumber"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "ContactEmail", oCopyFrom[sAddressType + "ContactEmail"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "AltContactPerson", oCopyFrom[sAddressType + "AltContactPerson"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "AltContactNumber", oCopyFrom[sAddressType + "AltContactNumber"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "AltContactEmail", oCopyFrom[sAddressType + "AltContactEmail"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Date", oCopyFrom[sAddressType + "Date"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "Time", oCopyFrom[sAddressType + "Time"]);
			this._editRequestModel.setProperty(sPathTo + "/" + sAddressType + "SpecLoc", oCopyFrom[sAddressType + "SpecLoc"]);

			if (sAddressType === Constants.LOCATION_DELIVERY) {
				// 1.1 Update fields related to 'Delivery'.
				this._editRequestModel.setProperty(sPathTo + "/" + "TransportMode", oCopyFrom.TransportMode);
				this._editRequestModel.setProperty(sPathTo + "/" + "TransportModeDesc", oCopyFrom.TransportModeDesc);
				this._editRequestModel.setProperty(sPathTo + "/" + "TruckType", oCopyFrom.TruckType);
				this._editRequestModel.setProperty(sPathTo + "/" + "TruckTypeDesc", oCopyFrom.TruckTypeDesc);
				this._editRequestModel.setProperty(sPathTo + "/" + "ContainerType", oCopyFrom.ContainerType);
				this._editRequestModel.setProperty(sPathTo + "/" + "ContainerTypeDesc", oCopyFrom.ContainerTypeDesc);
			} else {
				// 1.2 Update fields related to 'Pickup'.
				this._editRequestModel.setProperty(sPathTo + "/" + "DeliveryType", oCopyFrom.DeliveryType);
				this._editRequestModel.setProperty(sPathTo + "/" + "DeliveryTypeDesc", oCopyFrom.DeliveryTypeDesc);
			}

			// 2. Update bCopiedDelivery or bCopiedPickup and its ValueHeps if applicable.
			// this._editRequestModel.setProperty(sPathTo + "/b" + sAddressType + "Copied", false); // Copied fields should still be editable.
			this._editRequestModel.setProperty(sPathTo + "/ValueHelps/" + sAddressType, oCopyFrom.ValueHelps[sAddressType]);
			this._editRequestModel.refresh(true);
		},

		/**
		 * Retrieves all the valuehelps for the address (Province, City,and Barangay)
		 * @return {object} Returns Promise solved with empty parameter.
		 * @private
		 */
		_fnSubmitRequestMData: function () {
			return new Promise(function (fnResolve, fnReject) {
				this.getView().getModel("ZSSD_ONELOOK_MDATA_SRV").submitChanges({
					groupId: Constants.ODATA_GROUP_ID,
					success: fnResolve,
					error: fnReject
				});
			}.bind(this));
		},

		/**
		 * Process Freaight Cost Data
		 * @param {array} aResponse Contains the batch responses from freight cost
		 * @return {object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnProcessFreightCost: function (aResponse) {
			var aItems = this._editRequestModel.getProperty("/NAV_OLHeader_Item");
			var oBatchResponse = aResponse.__batchResponses[0]; //there will always one batchresponse
			if (oBatchResponse.hasOwnProperty("data") && oBatchResponse.data.results.length > 0) {
				aItems.forEach(function (oItem, iIndex) {
					oBatchResponse.data.results.forEach(function (oResults) {
						if (oResults.PackageNo === oItem.PackageNo) {
							aItems[iIndex].EstimatedCost = oResults.FreightCost;
							return;
						}
					});
				});
			}
			// this._editRequestModel.refresh(true);
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aItems);
			return Promise.resolve();
		},

		/**
		 * Process Courier Data
		 * @param {array} aResponse Contains the batch responses from request
		 * @return {object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnProcessCouriers: function (aResponse) {
			var aItems = this._editRequestModel.getProperty("/NAV_OLHeader_Item");
			var oBatchResponse = aResponse.__batchResponses[0]; //there will always one batchresponse
			if (oBatchResponse.hasOwnProperty("data") && oBatchResponse.data.results.length > 0) {
				aItems.forEach(function (oItem, iIndex) {
					var aCouriers = [];
					oBatchResponse.data.results.forEach(function (oResult) {
						if (oResult.PackageNo === oItem.PackageNo) {
							aCouriers.push(oResult);
						}
					});
					aItems[iIndex].ValueHelps.Courier = aCouriers;
					// Start of insert - MS223343 - PAL-2023-003
					var oCourier = oBatchResponse.data.results.filter(function (oResult) {
						return oResult.Courier === oItem.Courier;
					});
					if (oCourier.length === 0) {
						oItem.Courier = "";
					}
					// End of insert - MS223343 - PAL-2023-003
				});
			}
			// this._editRequestModel.refresh(true);
			this._editRequestModel.setProperty("/NAV_OLHeader_Item", aItems);
			return Promise.resolve();
		},

		/**
		 * Computes the total shipment cost of the request
		 * @private
		 */
		_fnComputeTotalEstimatedCost: function () {
			var aItem = this._editRequestModel.getProperty("/NAV_OLHeader_Item");
			var iEstimatedCost = 0;

			aItem.forEach(function (oItem) {
				iEstimatedCost = iEstimatedCost + parseFloat(oItem.EstimatedCost);
			});
			this._editRequestModel.setProperty("/TotalEstimatedCost", iEstimatedCost.toString());
		},

		/**
		 * Replaces the value of a field with ""
		 * @param {String} sPath contains the item path
		 * @param {String} sLocation contains the path for loacation
		 * @param {Array} aFields contains the field names to be cleared
		 * @private
		 */
		_fnClearAddressFields: function (sPath, sLocation, aFields) {
			for (var i = 0; i < aFields.length; i++) {
				this._editRequestModel.setProperty(sPath + "/" + (sLocation + aFields[i]), "");
			}

			return Promise.resolve();
		},

		/**
		 * Validate if all delivery/pickup address details of package items are the same.
		 * Applicable only if DTD request status is 'Returned'.
		 * @return {Promise} Returns Promise resolve or reject.
		 * @private
		 */
		_fnValidateDeliveryAddress: function () {
			var oContext = this;
			var bIsSameDeliveryAdd = true;
			var oContextProp = this._editRequestModel.getProperty("/");
			if (oContextProp.StatusId === Constants.REPORT_STATUS_RETURNED && oContextProp.NAV_OLHeader_Item.length > 1) {
				this._editRequestModel.getProperty("/NAV_OLHeader_Item").some(function (oElem, iIdx, aArr) {
					aArr.some(function (oAllItems) {
						if (oElem.TransportMode !== oAllItems.TransportMode ||
							oContext.formatter.formatDate(oElem.DeliveryDate) !== oContext.formatter.formatDate(oAllItems.DeliveryDate) ||
							oContext.formatter.formatTime(oElem.DeliveryTime) !== oContext.formatter.formatTime(oAllItems.DeliveryTime) ||
							oElem.DeliveryType !== oAllItems.DeliveryType ||
							oElem.DeliveryUnitNo !== oAllItems.DeliveryUnitNo ||
							oElem.DeliveryHouseNo !== oAllItems.DeliveryHouseNo ||
							oElem.DeliveryStreet !== oAllItems.DeliveryStreet ||
							oElem.DeliverySubdivision !== oAllItems.DeliverySubdivision ||
							oElem.DeliveryArea !== oAllItems.DeliveryArea ||
							oElem.DeliveryProvince !== oAllItems.DeliveryProvince ||
							oElem.DeliveryCity !== oAllItems.DeliveryCity ||
							oElem.DeliveryBarangay !== oAllItems.DeliveryBarangay ||
							oElem.ContainerType !== oAllItems.ContainerType ||
							oElem.TruckType !== oAllItems.TruckType ||
							oElem.DeliverySpecLoc !== oAllItems.DeliverySpecLoc ||
							// Pickup details
							oElem.PickupUnitNo !== oAllItems.PickupUnitNo ||
							oElem.PickupHouseNo !== oAllItems.PickupHouseNo ||
							oElem.PickupStreet !== oAllItems.PickupStreet ||
							oElem.PickupSubdivision !== oAllItems.PickupSubdivision ||
							oElem.PickupArea !== oAllItems.PickupArea ||
							oElem.PickupProvince !== oAllItems.PickupProvince ||
							oElem.PickupCity !== oAllItems.PickupCity ||
							oElem.PickupBarangay !== oAllItems.PickupBarangay ||
							oElem.PickupSpecLoc !== oAllItems.PickupSpecLoc ||
							oContext.formatter.formatDate(oElem.PickupDate) !== oContext.formatter.formatDate(oAllItems.PickupDate) ||
							oContext.formatter.formatTime(oElem.PickupTime) !== oContext.formatter.formatTime(oAllItems.PickupTime)) {
							bIsSameDeliveryAdd = false;
							return true;
						}
					});
					if (!bIsSameDeliveryAdd) return true;
				});

				// If not same delivery address, reject. Otherwise, resolve.
				return bIsSameDeliveryAdd ? Promise.resolve() : Promise.reject(this.getResourceBundle().getText("errorDeliveryPickupDetails"));
			}

			return Promise.resolve();
		},

		/**
		 * Navigates to Review Page
		 * @param {string} sTransType Contains type of transaction
		 * return {Promise} Returns promise resolve
		 * @private
		 */
		_fnNavigateToReviewPage: function (sTransType) {
			this.byId("EditContainer").to(this.getView().byId("reviewDynamicPage"));
			// this.fnResetRequiredFieldStates(this.getView().byId("ReviewPackageContent"), sTransType);
			return Promise.resolve();
		},

		/**
		 * Process the received data after bind element.
		 * @param {object} oEvent Contains the event object of Binding.
		 * @private
		 */
		_fnProcessDataReceived: function (oEvent) {
			var oParam = oEvent.getParameter("data");
			var aPaymentMode = this.getView().getModel("LocalMasterData").getProperty("/ModeOfPayment");
			if (!oParam) {
				this.getRouter().getTargets().display(Constants.ROUTE_NOT_FOUND);
				return;
			}
			// 1. Add necessarry flags
			for (var i = 0; i <= oParam.NAV_OLHeader_Item.length; i++) {
				if (oParam.NAV_OLHeader_Item.hasOwnProperty(i)) {
					oParam.NAV_OLHeader_Item[i].bShowDetails = true;
					oParam.NAV_OLHeader_Item[i].bPickupCopied = false;
					oParam.NAV_OLHeader_Item[i].bDeliveryCopied = false;
					oParam.NAV_OLHeader_Item[i].ValueHelps = Model.createValueHelpItem();
					oParam.NAV_OLHeader_Item[i].PickupTime = this.formatter.formatMilSecToDate(oParam.NAV_OLHeader_Item[i].PickupTime.ms);
					oParam.NAV_OLHeader_Item[i].DeliveryTime = this.formatter.formatMilSecToDate(oParam.NAV_OLHeader_Item[i].DeliveryTime.ms);
				}
			}
			//2. Set payment mode  index
			aPaymentMode.forEach(function (oPaymentMode, iIndex) {
				if (oParam.PaymentMode === oPaymentMode.PaymentMode) {
					oParam.PaymentModeIndex = iIndex;
				}
			});

			// 3. Initialize local model
			this._initializeViewModel(oParam.TransType, oParam.AccountType, oParam);

			// 4. Initialize master data
			this._initMasterData();

			// 5. Reset Field states
			this.fnResetRequiredFieldStates(this.getView().byId("editPackageContent"), oParam.TransType);
			this.fnResetRequiredFieldStates(this.getView().byId("ReviewPackageContent"), oParam.TransType);
		},

		/**
		 * Queue a batch request for Header (Deffered Mode).
		 * Mode: Create, Update or Delete.
		 * @private
		 */
		_fnRequestHeader: function () {
			// 1. Create header payload.
			var oPayload = this._fnBuildHeaderPayload();

			// 2. Request update in queue mode.
			this.getView().getModel().update("/" + this._fnCreateOLHeaderKey(), oPayload, {
				groupId: Constants.ODATA_GROUP_ID,
				refreshAfterChange: false
			});
		},

		/**
		 * Queue a batch request for Package line item (Deffered Mode).
		 * Mode: Create, Update or Delete.
		 * @private
		 */
		_fnRequestPackageLineItem: function () {
			var oProp = this._editRequestModel.getProperty("/");

			// Create record if not existing. Otherwise, update record.
			oProp.NAV_OLHeader_Item.forEach(function (oItem) {
				var oPayload = this._fnBuildPackageItemPayload(oItem);

				if (!this._fnCheckItemExistInServer(oPayload)) {
					oPayload.RefNo = this._refno;
					this.getView().getModel().create("/OLItemSet", oPayload, {
						groupId: Constants.ODATA_GROUP_ID
					});
				} else {
					this.getView().getModel().update("/" + this._fnCreateItemKey(oPayload, "OLItemSet"), oPayload, {
						groupId: Constants.ODATA_GROUP_ID
					});
				}
			}.bind(this));

			// Delete record if existing in maintenance queue.
			if (this._aDeletePackageItems.length > 0) {
				this._aDeletePackageItems.forEach(function (oItem) {
					this.getView().getModel().remove("/" + this._fnCreateItemKey(oItem, "OLItemSet"), {
						groupId: Constants.ODATA_GROUP_ID
					});
				}.bind(this));
			}
		},

		/**
		 * Queue a batch request for Attachment (Deffered Mode).
		 * Mode: Create, Delete.
		 * Attachment Line Item
		 * @private
		 */
		_fnRequestFileLineItem: function () {
			return new Promise(function (fnResolve, fnReject) {
				var aPromises = [];
				var aAttachments = this._editRequestModel.getProperty("/NAV_OLHeader_Attachment");
				aAttachments.forEach(function (oItem) {
					aPromises.push(new Promise(function (resolve, reject) {
						// Create record if not existing
						if (!this._fnCheckFileExistInServer(oItem)) {
							this.fnReadAttachment(oItem)
								.then(this.fnBuildBase64Attchment.bind(this, oItem))
								.then(this.fnRequestAttachment.bind(this, oItem, this._refno, "/AttachmentSet"))
								.then(function () {
									resolve();
								});
						} else {
							resolve();
						}
					}.bind(this)));
				}.bind(this));

				Promise.all(aPromises).then(function () {
					// Delete record if existing in maintenance queue.
					if (this._aDeleteFileMaint.length > 0) {
						this._aDeleteFileMaint.forEach(function (oItem) {
							this.getView().getModel().remove("/" + this._fnCreateFileKey(oItem, "AttachmentSet"), {
								groupId: Constants.ODATA_GROUP_ID
							});
						}.bind(this));
					}
					// Resolve Outer Promise
					fnResolve(aAttachments);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Queue a batch request for type of submission = Submit
		 * Mode: Function Import
		 * @private
		 */
		_fnRequestSubmit: function (oData) {
			return new Promise(function (fnResolve, fnReject) {
				if (!this._isDraft) {
					// 1. If this._isDraft = false, then submit type = 'Submit'.
					var sUserType = this.getModel("UserType").getProperty("/UserType");
					var sStatusId = this._fnFormatStatus(sUserType, this.getModel("editOLRequest").getProperty("/TransType"));

					this.fnCallFunctionImport("/CreateFinalDTD", "POST", {
							RefNo: this._refno,
							StatusId: sStatusId
						})
						.then(this.fnSubmitRequests.bind(this))
						.then(this.fnSuccessSubmit.bind(this))
						.then(fnResolve.bind(this))
						.catch(this.fnCatchError.bind(this));
				} else {
					// 2. Else, save/save draft only, resolve.
					fnResolve(oData);
				}
			}.bind(this));
		},

		/**
		 * Returns the Status ID of the submit button
		 * @param {string} UserType Contains the type or user
		 * @param {string} sTransType Contains the transaction type 
		 * @return {string} Returns Status ID
		 * @private
		 */
		_fnFormatStatus: function (UserType, sTransType) {
			if (sTransType === Constants.TRANS_TYPE_DOCUMENT) { //Submitted - Document
				return Constants.STATUS_SUBMIT_DOCUMENT;
			} else { //Submitted - Trade/Non-Trade
				return UserType === Constants.USER_TYPE_REGULAR ? Constants.STATUS_SUBMIT_REGULAR : Constants.STATUS_SUBMIT_PREAPPROVED;
			}
		},

		/**
		 * Build the payload for header on save/submit request.
		 * @return {object} Returns Header structure payload.
		 * @public
		 */
		_fnBuildHeaderPayload: function () {
			var oCloneHeaderObj = jQuery.extend(true, {}, this._editRequestModel.getProperty("/"));

			// Delete line items.
			delete oCloneHeaderObj.NAV_OLHeader_Attachment;
			delete oCloneHeaderObj.NAV_OLHeader_Item;
			delete oCloneHeaderObj.NAV_OLHeader_Result;
			delete oCloneHeaderObj.NAV_OLHeader_ProcessLane;
			delete oCloneHeaderObj.NAV_OLHeader_ProcessNode;
			// Start of insert MS223343 - PAL-2023-002
			delete oCloneHeaderObj.TruckTypeVisibility;
			// End of insert MS223343 - PAL-2023-002

			return oCloneHeaderObj;
		},

		/**
		 * Build the payload for package item on save/submit request.
		 * @return {object} Returns Package item structure payload.
		 * @public
		 */
		_fnBuildPackageItemPayload: function (oItem) {
			var oCloneItemObj = jQuery.extend(true, {}, oItem);

			// 1. Format date to edm.time
			oCloneItemObj.PickupTime = this.formatter.formatDateToTime(oCloneItemObj.PickupTime);
			oCloneItemObj.DeliveryTime = this.formatter.formatDateToTime(oCloneItemObj.DeliveryTime);

			// 2. Format date to UTC
			oCloneItemObj.PickupDate = this.formatter.formatUTC(oCloneItemObj.PickupDate);
			oCloneItemObj.DeliveryDate = this.formatter.formatUTC(oCloneItemObj.DeliveryDate);

			// 3. Delete unnecessary fields.
			delete oCloneItemObj.ValueHelps;
			delete oCloneItemObj.bShowDetails;
			delete oCloneItemObj.bPickupCopied;
			delete oCloneItemObj.bDeliveryCopied;
			delete oCloneItemObj.PackageNo;

			// 4. Format data type from int to string
			oCloneItemObj.Quantity = oCloneItemObj.Quantity.toString();

			return oCloneItemObj;
		},

		/**
		 * Close busy dialog, reset control and models after a success request.
		 * @private
		 */
		_fnProcessSuccess: function (oData) {
			var oPayload = oData.__batchResponses[0].__changeResponses[0].data;
			var sRefNos = oPayload ? oPayload.RefNos : this._refno;
			var sMsgTitle = this._isDraft ? "successSaveTitle" : "successSaveSubmitTitle";
			var sMsgText = sRefNos.split(",").length > 1 ? "successSavePluralContentText" : "successSaveSingleContentText";

			// 1. Close dialog
			this.setBusyDialogOff();

			// 2. Reset controls, models.
			// this._fnToggleEditMode(false);
			// this._fnResetModel();
			// this._createMaintenanceEnties();
			// this._bindView(this._sPath);

			// 3. Show success msg
			this.showDialog({
					title: this.getResourceBundle().getText(sMsgTitle),
					msg: this.getResourceBundle().getText(sMsgText, sRefNos)
				})
				.then(this.fnNavigateTo.bind(this, Constants.ROUTE_REPORT));
		},

		/**
		 * Create OData key for OLFHeaderSet
		 * @param {object} oParam Contains payload.
		 * @private
		 */
		_fnCreateOLHeaderKey: function () {
			var sKey = this.getView().getModel().createKey("OLHeaderSet", {
				RefNo: this._refno
			});
			return sKey;
		},

		/**
		 * Create OData key for OLItemSet, AttachmentSet
		 * @param {object} oParam Contains payload.
		 * @private
		 */
		_fnCreateItemKey: function (oParam, sPath) {
			var sKey = this.getModel().createKey(sPath, {
				RefNo: oParam.RefNo,
				DtdItem: oParam.DtdItem
			});

			return sKey;
		},

		/**
		 * Create OData key for AttachmentSet
		 * @param {object} oParam Contains payload.
		 * @private
		 */
		_fnCreateFileKey: function (oParam, sPath) {
			var sKey = this.getModel().createKey(sPath, {
				RefNo: oParam.RefNo,
				DocItem: oParam.DocItem
			});

			return sKey;
		},

		/**
		 * Check the payload field if request is create or edit.
		 * @param {object} oPayload Contains the payload of edit mode.
		 * @private
		 */
		_fnCheckItemExistInServer: function (oPayload) {
			return oPayload.hasOwnProperty("RefNo");
			//&& oPayload.hasOwnProperty("Linenum")
		},

		/**
		 * Check the payload field if request is create.
		 * @param {object} oPayload Contains the payload of edit mode.
		 * @private
		 */
		_fnCheckFileExistInServer: function (oPayload) {
			return oPayload.hasOwnProperty("RefNo") && oPayload.hasOwnProperty("DocItem");
		},

		/**
		 * Create a global array variable to maintain all deleted entries in a line item.
		 * @private
		 */
		_createMaintenanceEnties: function () {
			// Package Items Maintenance
			this._aDeletePackageItems = [];
			// Attachment Maintenance
			this._aDeleteFileMaint = [];
		}
	});
});