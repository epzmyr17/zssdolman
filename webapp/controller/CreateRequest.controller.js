sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/globe/OneLook_CreateDTDRequest/model/formatter",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/globe/OneLook_CreateDTDRequest/model/EmailType",
	"sap/m/MessageToast",
	"com/globe/OneLook_CreateDTDRequest/model/Constants"
], function (Controller, JSONModel, History, Formatter, Model, Filter, FilterOperator, EmailType, MessageToast, Constants) {
	"use strict";

	/**
	 * Create Request controller for the object header, and table layout.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.CreateRequest
	 */
	return Controller.extend("com.globe.OneLook_CreateDTDRequest.controller.CreateRequest", /** @lends com.globe.OneLook_CreateDTDRequest.controller.CreateRequest */ {
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the detail controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateRequest").attachPatternMatched(this.onRouteMatched, this);

			this.fnInitMessageManager();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/*
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @public
		 */
		onRouteMatched: function (oEvt) {
			var oArguments = oEvt.getParameter("arguments");
			var sRequestType = oArguments.RequestType;
			var sAccountType = oArguments.AccountType;
			this.fnAttachedDefferedModel();
			this._initializeViewModel(sRequestType, sAccountType);
			this._initMasterData();
			//Reset Required Fields for edit and review page
			this.fnResetRequiredFieldStates(this.getView().byId("editPackageContent"), sRequestType);
			this.fnResetRequiredFieldStates(this.getView().byId("ReviewPackageContent"), sRequestType);
			this._fnSetDefaultPage();
			this.fnRemoveMessageManager();
		},

		/**
		 * Event handler when back button is clicked
		 * @public
		 */
		onNavBack: function () {
			this.fnNavigateTo(Constants.ROUTE_DASHBOARD);
		},
		/**
		 * Event handler when dashboard link is click on breadcrumbs
		 */
		onPressDashboard: function () {
			this.fnNavigateTo(Constants.ROUTE_DASHBOARD);
		},

		/**
		 * Event handler when home link is click on breadcrumbs
		 */
		onPressHome: function () {
			this.fnNavigateToFLP();
		},

		onPrevious: function () {
			var oNavContainer = this.byId("EditContainer");
			oNavContainer.backToPage(this.getView().byId("editPage"));

			// Remove message manager.
			// this.fnRemoveMessageManager();
		},

		/*
		 * Event handler when Item Type was change
		 * @public
		 */
		onItemTypeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			var sPath = oSource.getBindingContext("items").getPath();

			this._itemModel.setProperty(sPath + "/ItemTypeDesc", oSelectedItem.getText());
			this._fnValidateFields(oEvt.getSource());
		},

		/*
		 * Event handler when Material Type was change
		 * @public
		 */
		onMaterialTypeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			var sPath = oSource.getBindingContext("items").getPath();

			this._itemModel.setProperty(sPath + "/MaterialTypeDesc", oSelectedItem.getText());
			this._fnValidateFields(oEvt.getSource());
		},

		/**
		 * Event handler when Add Package button is clicked
		 * @public
		 */
		onAddPackage: function () {
			var aItems = this._itemModel.getProperty("/");
			var iItemCount = this._itemModel.getData().length;
			var iPackageCount = iItemCount + 1;

			aItems.push(Model.createItemsModel(this.getResourceBundle(), ("0" + iPackageCount).slice(-2),
				this._viewModel.getProperty("/MinDate")));
			this._itemModel.setProperty("/", aItems);
			this._viewModel.setProperty("/PackageCount", iPackageCount);
		},
		/*
		 * Event handler field value was change
		 * @public
		 */
		onValueChange: function (oEvt) {
			var oControl = oEvt.getSource();
			this._fnValidateFields(oControl);
		},

		/*
		 * Event handler when delivery type value was change
		 * @public
		 */
		onDeliveryTypeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var oSelectedItem = oSource.getSelectedItem();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			this._itemModel.setProperty(sPath + "/DeliveryTypeDesc", oSelectedItem.getText());
			// End of edit MS223343 - PAL-2023-002

			// Start of insert MS223343 - PAL-2023-010
			var i18n = this.getResourceBundle();
			if (this._itemModel.getProperty(sPath + "/TransportMode") === "AIR" && oSelectedItem.getKey() === "LE") {
				MessageToast.show(i18n.getText("errorDelivType"));
				this._itemModel.setProperty(sPath + "/DeliveryType", "");
				this._itemModel.setProperty(sPath + "/DeliveryTypeDesc", "");
			}
			// Start of insert MS223343 - PAL-2023-010

			this._fnValidateFields(oEvt.getSource());
		},

		/*
		 * Event handler when hide/show details button is clicked
		 * @public
		 */
		onTogglePackageDetails: function (oEvt) {
			var oSource = oEvt.getSource();
			var oBindingContext = oSource.getBindingContext("items");
			var sPath = oBindingContext.getPath();
			var oItemsModel = this.getView().getModel("items");
			var bDetailsDisplay = oItemsModel.getProperty(sPath + "/bShowDetails");

			oItemsModel.setProperty(sPath + "/bShowDetails", !bDetailsDisplay);

		},

		/*
		 * Event handler when pickup/Delivery location was changed.
		 * @public
		 */
		onLocationChange: function (oEvt) {
			var oSource = oEvt.getSource();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			// End of edit MS223343 - PAL-2023-002
			var sSelectedKey = oSource.getSelectedKey();
			var sAddressType = oSource.data("DetailInfo");
			var aFilters = [];
			var aFields = ["Area", "Province", "ProvinceDesc", "City", "CityDesc", "Barangay", "BarangayDesc",
				"UnitNo", "HouseNo", "Subdivision", "Street", "Location", "LocationDesc", "Zipcode", "SpecLoc", "ContactPerson", "ContactNumber",
				"ContactEmail"
			];
			//Add filters
			aFilters.push(new Filter("PickupLoc", FilterOperator.EQ, sSelectedKey));
			aFilters.push(new Filter("TransType", FilterOperator.EQ, this._viewModel.getProperty("/TransactionType")));
			//Udpate description fields and adresses
			this._fnUpdateDescField(sPath, sAddressType, "OriginDesc", oSource.getSelectedItem().getText());
			this._fnValidateFields(oEvt.getSource());
			this._fnClearAddressFields(sPath, sAddressType, aFields);
		},

		/*
		 * Event handler when specific location was changed and populate list of province
		 * @public
		 */
		onSpecLocChange: function (oEvt) {
			var oSource = this._oInputAddress;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			// End of edit MS223343 - PAL-2023-002
			var sAddressType = oSource.data("DetailInfo");
			var oSelectedItem = oEvt.getParameter("selectedItem");
			var oDetails = oSelectedItem.data("location");
			var aFields = ["Area", "Province", "ProvinceDesc", "City", "CityDesc", "Barangay", "BarangayDesc",
				"UnitNo", "HouseNo", "Subdivision", "Street", "Zipcode", "ContactPerson", "ContactNumber", "ContactEmail"
			];

			this._fnClearAddressFields.bind(sPath, sAddressType, aFields);
			this._fnUpdateDescField(sPath, sAddressType, "Location", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sAddressType, "LocationDesc", oSelectedItem.getTitle());
			this._fnPopulateAddress(oDetails, sPath, sAddressType);
			this._fnValidateFields(oSource);
		},

		/*
		 * Event handler when region was changed and populate list of province
		 * @public
		 */
		onAreaChange: function (oEvt) {
			var oSource = oEvt.getSource();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oSource.getSelectedItem();
			var sSelectedKey = oSource.getSelectedKey();
			var sAddressType = oSource.data("DetailInfo");
			var aFields = ["Province", "ProvinceDesc", "City", "CityDesc", "Barangay", "BarangayDesc", "Zipcode"];
			var aFilters = [];
			aFilters.push(new Filter("Area", FilterOperator.EQ, sSelectedKey));

			this._fnValidateFields(oEvt.getSource());
			this._fnUpdateDescField(sPath, sAddressType, "AreaDesc", oSelectedItem.getText());
			this._fnClearAddressFields(sPath, sAddressType, aFields);
		},

		/*
		 * Event handler when province was changed and populate list of cities
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAddProvince: function (oEvt) {
			var oSource = this._oInputProvince;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oEvt.getParameter("selectedItem");
			var sAddressType = oSource.data("DetailInfo");
			var aFields = ["City", "CityDesc", "Barangay", "BarangayDesc", "Zipcode"];

			this._fnUpdateDescField(sPath, sAddressType, "Province", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sAddressType, "ProvinceDesc", oSelectedItem.getTitle());
			this._fnValidateFields(oSource);
			this._fnClearAddressFields(sPath, sAddressType, aFields);
		},

		/*
		 * Event handler when city was changed and populate list of barangay
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAddCity: function (oEvt) {
			var oSource = this._oInputCity;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oEvt.getParameter("selectedItem");
			var sAddressType = oSource.data("DetailInfo");
			var aFields = ["Barangay", "BarangayDesc", "Zipcode"];

			this._fnUpdateDescField(sPath, sAddressType, "City", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sAddressType, "CityDesc", oSelectedItem.getTitle());
			this._fnValidateFields(oSource);
			this._fnClearAddressFields(sPath, sAddressType, aFields);
		},

		/*
		 * Event handler when barangay was changed and populate list zipcode
		 * @param {object} oEvent Contains the Combo Box event object.
		 * @public
		 */
		onAddBrgy: function (oEvt) {
			var oSource = this._oInputBrgy;
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			// End of edit MS223343 - PAL-2023-002
			var oSelectedItem = oEvt.getParameter("selectedItem");
			var sAddressType = oSource.data("DetailInfo");
			var sZipCode = oSelectedItem.data("zipcode");

			this._fnUpdateDescField(sPath, sAddressType, "Barangay", oSelectedItem.getDescription());
			this._fnUpdateDescField(sPath, sAddressType, "BarangayDesc", oSelectedItem.getTitle());
			this._itemModel.setProperty(sPath + '/' + sAddressType + "Zipcode", sZipCode);
			this._fnValidateFields(oSource);
		},
		/*
		 * Event handler when mode of transport was changed and popultae description
		 * @public
		 */
		onTransportModeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			var oSelectedItem = oSource.getSelectedItem();
			var aFields = ["ContainerType", "ContainerTypeDesc"];
			// End of edit MS223343 - PAL-2023-002

			//1. update description field
			this._itemModel.setProperty(sPath + "/TransportModeDesc", oSelectedItem.getText());

			// Start of insert MS223343 - PAL-2023-002
			// Filter Delivery Type
			// Start of change MS223343 - PAL-2023-010
			if (oSelectedItem.getKey() === "SEA" || oSelectedItem.getKey() === "RORO" || oSelectedItem.getKey() === "RORT") {
				this._itemModel.setProperty(sPath + "/DeliveryType", "N");
				this._itemModel.setProperty(sPath + "/DeliveryTypeDesc", "Normal");
			}
			// End of change MS223343 - PAL-2023-010
			// End of insert MS223343 - PAL-2023-002

			//2. validate field
			this._fnValidateFields(oSource);
			// 3. Clear fields
			for (var i = 0; i < aFields.length; i++) {
				this._itemModel.setProperty(sPath + "/" + aFields[i], "");
			}
		},

		// Start of insert MS223343 - PAL-2023-002
		/**
		 * Event handler to clear selected manpower when switch to false.
		 * @private
		 */
		onManpowerChange: function (oEvent) {
			var oParam = oEvent.getParameters();
			var oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext("items").getPath();

			if (!oParam.state) {
				this._itemModel.setProperty(sPath + "/Manpower", "");
			}
		},

		/**
		 * Event handler to clear selected Crate when switch to false.
		 * @private
		 */
		onCrateChange: function (oEvent) {
			var oParam = oEvent.getParameters();
			var oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext("items").getPath();

			if (!oParam.state) {
				this._itemModel.setProperty(sPath + "/Crate", "");
			}
		},

		_fnValidateTruckType: function () {
			var aItem = this._itemModel.getData();
			var iTotalWeight = 0;
			var iTotalVolumeMetricWeight = 0;
			var bTruckTypeVisibility = false;
			var sTransportMode = "";

			aItem.forEach(function (oItem) {
				sTransportMode = oItem.TransportMode;
				iTotalWeight = iTotalWeight + parseFloat(oItem.Weight);
				iTotalVolumeMetricWeight = iTotalVolumeMetricWeight + Formatter.formatVolumeMetricWeight(oItem.Length, oItem.Width, oItem.Height);
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

			this._requestHeaderModel.setProperty("/TruckTypeVisibility", bTruckTypeVisibility);
		},
		// End of insert MS223343 - PAL-2023-002

		/*
		 * Event handler when trucktype was changed and popultae description
		 * @public
		 */
		// Start of edit MS223343 - PAL-2023-002
		onTruckTypeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var sPath = "/0";
			var oSelectedItem = oSource.getSelectedItem();
			this._itemModel.setProperty(sPath + "/TruckTypeDesc", oSelectedItem.getText());
			this._itemModel.setProperty(sPath + "/Courier", "");

			var aItems = this.fnCopyItemDetails(this._itemModel.getData());
			this._itemModel.setProperty("/", aItems);

			if (this.getView().getModel("UserType").getProperty("/UserType") === "PA" || this._requestHeaderModel.getProperty("/TransType") ===
				"DT") {
				this._fnValidateFields(oEvt.getSource());
			} else {
				this.setBusyDialogOn();
				this.fnRequestFreightCost(this._itemModel.getData(), this._requestHeaderModel.getProperty("/"))
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

			var aItems = this.fnCopyItemDetails(this._itemModel.getData());
			this._itemModel.setProperty("/", aItems);

			this.setBusyDialogOn();
			this.fnRequestFreightCost(this._itemModel.getData(), this._requestHeaderModel.getProperty("/"))
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
		/*
		 * Event handler when trucktype was changed and popultae description
		 * @public
		 */
		onContainerTypeChange: function (oEvt) {
			var oSource = oEvt.getSource();
			// Start of edit MS223343 - PAL-2023-002
			// var sPath = oSource.getBindingContext("items").getPath();
			var sPath = "/0";
			var oSelectedItem = oSource.getSelectedItem();
			this._itemModel.setProperty(sPath + "/ContainerTypeDesc", oSelectedItem.getText());
			this._itemModel.setProperty(sPath + "/Courier", "");
			// End of edit MS223343 - PAL-2023-002

			// Start of insert MS223343 - PAL-2023-002
			var aItems = this.fnCopyItemDetails(this._itemModel.getData());
			this._itemModel.setProperty("/", aItems);

			if (this.getView().getModel("UserType").getProperty("/UserType") === "PA" || this._requestHeaderModel.getProperty("/TransType") ===
				"DT") {
				this._fnValidateFields(oEvt.getSource());
			} else {
				this.setBusyDialogOn();
				this.fnRequestFreightCost(this._itemModel.getData(), this._requestHeaderModel.getProperty("/"))
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

		onDeliveryDateTimeChange: function (oEvt) {
			this._fnValidateFields(oEvt.getSource());
		},

		onPickupDateTimeChange: function (oEvt) {
			this._fnValidateFields(oEvt.getSource());
		},

		/*
		 * Event handler when next button is clicked.
		 * @public
		 */
		onPressNext: function (oEvt) {
			var oDynamicForm = this.getView().byId("editPackageContent");
			var sTransactionType = this.getView().getModel("viewModel").getProperty("/TransactionType");
			//Validate fields
			var bFormValidationError = this.fnValidateRequiredFields(oDynamicForm, sTransactionType);
			var i18n = this.getResourceBundle();

			// if there is no error in the form validation, proceed with validating serviceable area and SLA.
			if (!bFormValidationError) {
				this.setBusyDialogOn();
				// Start of edit MS223343 - PAL-2023-002
				var aItems = this.fnCopyItemDetails(this._itemModel.getData());
				this._itemModel.setProperty("/", aItems);
				this._fnValidateTruckType();
				// Start of insert MS223343 - PAL-2023-004 / 007
				this.fnComputeChargeableWeight(this.getView().getModel("MasterData"), aItems);
				// End of insert MS223343 - PAL-2023-004 / 007
				// if (this._requestHeaderModel.getProperty("/TruckTypeVisibility") || aItems[0].TransportMode === "SEA") {
				// 	this.fnCheckCouriers(this._itemModel.getData())
				// 		.then(this.fnSubmitRequests.bind(this))
				// 		.then(this.fnSuccessCouriers.bind(this))
				// 		.then(this._fnProcessCouriers.bind(this))
				// 		.then(this._fnNavigateToReviewPage.bind(this, sTransactionType)) //no errors, can proceed  to next page
				// 		.then(this.setBusyDialogOff.bind(this))
				// 		.catch(this.fnCatchError.bind(this));
				// } else {
				this.fnCheckCouriers(this._itemModel.getData())
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessCouriers.bind(this))
					.then(this._fnProcessCouriers.bind(this))
					.then(this.fnRequestFreightCost.bind(this, this._itemModel.getData(), this._requestHeaderModel.getProperty("/")))
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessFreightCost.bind(this))
					.then(this._fnProcessFreightCost.bind(this))
					.then(this._fnComputeTotalEstimatedCost.bind(this))
					.then(this._fnNavigateToReviewPage.bind(this, sTransactionType)) //no errors, can proceed  to next page
					.then(this.setBusyDialogOff.bind(this))
					.catch(this.fnCatchError.bind(this));
				// }
				// End of edit MS223343 - PAL-2023-002
			} else {
				this.showMsgBoxError(i18n.getText("ValidationError"));
			}
		},

		/**
		 * Event handler when cancel button is clicked.
		 * @public
		 */
		onCancel: function () {
			if (!this.oUnsavedChangeDialog) {
				this.oUnsavedChangeDialog = sap.ui.xmlfragment(
					this.getView().getId(), "com.globe.OneLook_CreateDTDRequest.fragment.Dialog.UnsavedChanges", this);
				this.getView().addDependent(this.oUnsavedChangeDialog);
			}
			this.oUnsavedChangeDialog.open();
		},

		/**
		 * Event handler when proceed button is clicked from the dialog
		 * @public
		 */
		onNavDashboard: function () {
			this.onCloseDialog();
			this.fnNavigateTo(Constants.ROUTE_DASHBOARD);
		},

		/**
		 * Event handler when cancel button is clicked from the dialog
		 * @public
		 */
		onCloseDialog: function () {
			this.oUnsavedChangeDialog.close();
		},
		/**
		 * Event handler when proceed buttom was clicked
		 * @public
		 */
		onLaunchpadBack: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				"target": {
					"shellHash": "#"
				}
			});
		},

		/*
		 * Event handler when delete button is clicked
		 * @public
		 */
		onDeleteItem: function (oEvt) {
			var i18n = this.getResourceBundle();
			var oSource = oEvt.getSource();
			var oBindingContext = oSource.getBindingContext("items");
			var sPath = oBindingContext.getPath().slice(1);
			var aItems = this._itemModel.getProperty("/");

			aItems.splice(sPath, 1);
			this._fnUpdatePackageTitle(aItems);

			this._itemModel.setProperty("/", aItems);
			this._viewModel.setProperty("/PackageCount", this._itemModel.getData().length);
			this._fnComputeTotalEstimatedCost();
			MessageToast.show(i18n.getText("PackageDeleted"));
		},

		/*
		 * Event handler to copy pickup/delivery details entered from other package
		 * @public
		 */
		onCopyDetails: function (oEvt) {
			var oSource = oEvt.getSource();
			var sSelectedPath = oSource.getSelectedItem().getBindingContext("items").getPath();
			var sPath = oSource.getBindingContext("items").getPath();
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

		/**
		 * Event handler after selecting a file in file uploader control
		 * @param {object} oEvent Contains event object of file uploader.
		 */
		onFileSelect: function (oEvent) {
			var aAttachmentList = this._attachmentModel.getData();
			var oFile = oEvent.getParameter("files")[0];
			var iIndexFound = -1;
			if (oFile) {
				var oData = {
					FileName: oFile.name,
					file: oFile,
					FileSize: oFile.size,
					MimeType: oFile.type,
					Icon: Formatter.fnFormatFileIcon(oFile.type)
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
							aAttachmentList.splice(iIndexFound, 1, oData);
							this._attachmentModel.refresh(true);
						}.bind(this));
				} else {
					aAttachmentList.push(oData);
					this._attachmentModel.refresh(true);
				}
			}
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
				this._requestHeaderModel.setProperty("/Cashout", Constants.CASHOUT_DEFAULT_VALUE);
			}

			this._requestHeaderModel.setProperty("/PaymentMode", sPaymentType);
			this._requestHeaderModel.setProperty("/PaymentModeDesc", oSelectedItem.getText());
			this._requestHeaderModel.refresh(true);
		},

		/**
		 * Event handler when delete item is clicked in attachment section.
		 * @param {object} oEvent Contains event object of Custom List Item delete button.
		 */
		onFileDeleted: function (oEvent) {
			var oListItem = oEvent.getParameter("listItem");
			var sPath = oListItem.getBindingContextPath();
			var iIndexOfItem = sPath.slice(1);
			var oItem = this._attachmentModel.getProperty(sPath);

			this.showMsgBoxConfirm(this.getResourceBundle().getText("confirmDeleteFile", [oItem.FileName]))
				.then(function () {
					this._attachmentModel.getData().splice(iIndexOfItem, 1);
					this._attachmentModel.refresh(true);
				}.bind(this));
		},

		/**
		 * Opens a message box error when invalid file types is selected.
		 * @public
		 */
		onTypeMissmatch: function () {
			this.showMsgBoxError(this.getResourceBundle().getText("errorUploadFileTypeAttachment"));
		},

		/**
		 * Opens a message box error when max file size exceeded.
		 * @public
		 */
		onFileSizeExceed: function () {
			this.showMsgBoxError(this.getResourceBundle().getText("errorUploadFileSize"));
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
			var aItems = this.fnCopyItemDetails(this._itemModel.getData());
			this._itemModel.setProperty("/", aItems);
			// End of insert MS223343 - PAL-2023-002

			this._fnValidateRequiredFields(oDynamicForm, sTransactionType, this._isDraft)
				.then(this._fnRequestHeaderItems.bind(this))
				.then(this.fnSubmitRequests.bind(this))
				.then(this.fnSuccessSubmit.bind(this))
				.then(this._fnCheckAttachments.bind(this))
				.catch(this.fnCatchError.bind(this));
		},

		/**
		 * Event handler when Company was changed
		 * @public
		 */
		onCompanyChange: function (oEvt) {
			var oSource = oEvt.getSource();
			var oSelectedItem = oSource.getSelectedItem();

			this._requestHeaderModel.setProperty("/CompanyDesc", oSelectedItem.getProperty("text"));
			// Start of insert - MS223343 - PAL-2023-003
			this._requestHeaderModel.setProperty("/CostCenter", "");
			var oModel = this.getView().getModel("MasterData");
			if (oModel.getProperty("/costCenterNode")) {
				oModel.setProperty("/costCenterNode", "");
			}
			// End of insert - MS223343 - PAL-2023-003
			this._fnValidateFields(oEvt.getSource());
		},
		/**
		 * Event handler when segment order was changed
		 * opens a table select dialog for channels
		 * @public
		 */
		onValueHelpSegmentOrder: function (oEvt) {
			if (!this._oChannel) {
				this._oChannel = sap.ui.xmlfragment("com.globe.OneLook_CreateDTDRequest.fragment.Dialog.SegmentOrderChannel", this);
				this.getView().addDependent(this._oChannel);
			}
			this._oChannel.open();
		},

		/**
		 * Event handler when selecting a channel in the select table dialog
		 * @param {object} oEvt contains the event object of the select
		 * @public
		 */
		onSelectSegmentOrder: function (oEvt) {
			var oContext = oEvt.getParameter("selectedContexts")[0];
			var oView = this.getView();
			var aInputs = [oView.byId("SegmentOderInput"), oView.byId("SegmentOrderTypeInput"), oView.byId("ActivityInput")];
			this._requestHeaderModel.setProperty("/Activity", oContext.getObject().ActivityDesc);
			this._requestHeaderModel.setProperty("/SegmentOrderType", oContext.getObject().SegmentType);
			this._requestHeaderModel.setProperty("/SegmentOrder", oContext.getObject().SegmentOrder);
			this._requestHeaderModel.setProperty("/ChannelId", oContext.getObject().ChannelId);
			this._requestHeaderModel.refresh(true);

			oEvt.getSource().getBinding("items").filter([]); //clear filter

			//check fields
			aInputs.forEach(function (oInput) {
				this._fnValidateFields(oInput);
			}.bind(this));
		},

		/**
		 * Event handler whe searching in the channel select table dialog
		 * @param {Object} oEvt Contains the event object
		 * @public
		 */
		onSearchSegmentOrder: function (oEvt) {
			var sValue = oEvt.getParameter("value");
			var oBinding = oEvt.getSource().getBinding("items");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new sap.ui.model.Filter("SegmentOrder", sap.ui.model.FilterOperator.StartsWith, sValue));
			}
			oBinding.filter(aFilter);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Navigates to Review Page
		 * @param {string} sTransType Contains type of transaction
		 * @return {Promise} Returns promise resolve
		 * @private
		 */
		_fnNavigateToReviewPage: function (sTransType) {
			this.byId("EditContainer").to(this.getView().byId("reviewPage"));
			return Promise.resolve();
		},
		/**
		 * Copy datails from selected package
		 * @param {string} sPathFrom Contains path of the package to be copied
		 * @param {string} sPathTo Contains path of the package the details to be copied to
		 * @param {string} sAddressType Contains the location details
		 * @private
		 */
		_onCopyDetails: function (sPathFrom, sPathTo, sAddressType) {
			var oCopyFrom = this._itemModel.getProperty(sPathFrom);
			// 1. Update address fields: Pickup or Delivery.
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Origin", oCopyFrom[sAddressType + "Origin"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "OriginDesc", oCopyFrom[sAddressType + "OriginDesc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Location", oCopyFrom[sAddressType + "Location"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "LocationDesc", oCopyFrom[sAddressType + "LocationDesc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "UnitNo", oCopyFrom[sAddressType + "UnitNo"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "HouseNo", oCopyFrom[sAddressType + "HouseNo"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Street", oCopyFrom[sAddressType + "Street"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Subdivision", oCopyFrom[sAddressType + "Subdivision"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Area", oCopyFrom[sAddressType + "Area"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "AreaDesc", oCopyFrom[sAddressType + "AreaDesc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Province", oCopyFrom[sAddressType + "Province"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "ProvinceDesc", oCopyFrom[sAddressType + "ProvinceDesc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "City", oCopyFrom[sAddressType + "City"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "CityDesc", oCopyFrom[sAddressType + "CityDesc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Barangay", oCopyFrom[sAddressType + "Barangay"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "BarangayDesc", oCopyFrom[sAddressType + "BarangayDesc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Zipcode", oCopyFrom[sAddressType + "Zipcode"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "PickupSpecLoc", oCopyFrom[sAddressType + "PickupSpecLoc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "DeliverySpecLoc", oCopyFrom[sAddressType + "DeliverySpecLoc"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "ContactPerson", oCopyFrom[sAddressType + "ContactPerson"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "ContactNumber", oCopyFrom[sAddressType + "ContactNumber"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "ContactEmail", oCopyFrom[sAddressType + "ContactEmail"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "AltContactPerson", oCopyFrom[sAddressType + "AltContactPerson"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "AltContactNumber", oCopyFrom[sAddressType + "AltContactNumber"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "AltContactEmail", oCopyFrom[sAddressType + "AltContactEmail"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Date", oCopyFrom[sAddressType + "Date"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "Time", oCopyFrom[sAddressType + "Time"]);
			this._itemModel.setProperty(sPathTo + "/" + sAddressType + "SpecLoc", oCopyFrom[sAddressType + "SpecLoc"]);

			if (sAddressType === Constants.LOCATION_DELIVERY) {
				// 1.1 Update fields related to 'Delivery'.
				this._itemModel.setProperty(sPathTo + "/" + "TransportMode", oCopyFrom.TransportMode);
				this._itemModel.setProperty(sPathTo + "/" + "TransportModeDesc", oCopyFrom.TransportModeDesc);
				this._itemModel.setProperty(sPathTo + "/" + "TruckType", oCopyFrom.TruckType);
				this._itemModel.setProperty(sPathTo + "/" + "TruckTypeDesc", oCopyFrom.TruckTypeDesc);
				this._itemModel.setProperty(sPathTo + "/" + "ContainerType", oCopyFrom.ContainerType);
				this._itemModel.setProperty(sPathTo + "/" + "ContainerTypeDesc", oCopyFrom.ContainerTypeDesc);
			} else { //Pickup
				// 1.2 Update fields related to 'Pickup'.
				this._itemModel.setProperty(sPathTo + "/" + "DeliveryType", oCopyFrom.DeliveryType);
				this._itemModel.setProperty(sPathTo + "/" + "DeliveryTypeDesc", oCopyFrom.DeliveryTypeDesc);
			}

			// 2. Update bCopiedDelivery or bCopiedPickup and its ValueHeps if applicable.
			// this._itemModel.setProperty(sPathTo + "/b" + sAddressType + "Copied", false); // Copied fields should still be editable.
			this._itemModel.setProperty(sPathTo + "/ValueHelps/" + sAddressType, oCopyFrom.ValueHelps[sAddressType]);
			// this._itemModel.refresh(true);
		},

		/**
		 * Initializes masterdata
		 * @private
		 */
		_initMasterData: function () {
			var oViewModel = this.getView().getModel("viewModel");
			var sTransType = oViewModel.getProperty("/TransactionType");
			this.getView().setModel(new JSONModel({}), "MasterData");
			this.oMasterModel = this.getView().getModel("ZSSD_ONELOOK_MDATA_SRV");

			this._initItemType(sTransType);
			this._initModeOfTransport(sTransType);

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
		 * @return {Object} Returns Promise resolve with no parameter
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
		_initializeViewModel: function (sRequestType, sAccountType) {
			this._setViewModel(sRequestType, sAccountType);
			this._setRequestHeaderData();
			this._setItemData();
			this._setAttachmentModel();
		},

		/**
		 * creates view model
		 * @param {String} sRequestType contains the transaction type
		 * @param {String} sAccountType Contains the Account type for trade request
		 * @private
		 */
		_setViewModel: function (sRequestType, sAccountType) {
			this._viewModel = Model.createViewModel(sRequestType, sAccountType);
			this.getView().setModel(this._viewModel, "viewModel");
		},

		/**
		 * creates header model
		 * @private
		 */
		_setRequestHeaderData: function () {
			var oViewModel = this.getView().getModel("viewModel");
			this._requestHeaderModel = Model.createHeaderModel(oViewModel.getProperty("/TransactionType"), oViewModel.getProperty(
				"/AccountType"));
			this.getView().setModel(this._requestHeaderModel, "DTDRequest");
		},

		/**
		 * Initializes item model
		 * @private
		 */
		_setItemData: function () {
			this._itemModel = new JSONModel([Model.createItemsModel(this.getResourceBundle(), "01", this._viewModel.getProperty("/MinDate"))]);
			this.getView().setModel(this._itemModel, "items");
		},

		_setAttachmentModel: function () {
			this._attachmentModel = new JSONModel([]);
			this.getView().setModel(this._attachmentModel, "Attachment");
		},

		/**
		 * Updates value helps list
		 * @param {String} sPath contains the item path
		 * @param {String} sAddressType contains the path for loacation
		 * @param {String} sValueHelpField contains the name of the field with valuehelp
		 * @param {Object} oData Contains data returned by the service
		 * @return {object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnUpdateItemValueHelp: function (sPath, sAddressType, sValueHelpField, oData) {
			var oItemData = this._itemModel.getData();
			oItemData[sPath].ValueHelps[sAddressType][sValueHelpField] = oData.results;

			this._itemModel.refresh(true);
			return Promise.resolve();
		},

		/**
		 * Replaces the value of a field with ""
		 * @param {String} sPath contains the item path
		 * @param {String} sAddressType contains the path for loacation
		 * @param {Array} aFields contains the field names to be cleared
		 * @return {Object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnClearAddressFields: function (sPath, sAddressType, aFields) {
			// var oItemData = this._itemModel.getData();
			for (var i = 0; i < aFields.length; i++) {
				this._itemModel.setProperty(sPath + "/" + sAddressType + aFields[i], "");
			}
			return Promise.resolve();
		},

		/**
		 * Updates description fields
		 * @param {String} sPath contains the item path
		 * @param {String} sAddressType contains the path for loacation
		 * @param {String} sFieldName contains the field name to update
		 * @param {String) sValue contains the updated value
		 * @private
		 */
		_fnUpdateDescField: function (sPath, sAddressType, sFieldName, sValue) {
			this._itemModel.setProperty(sPath + "/" + sAddressType + sFieldName, sValue);
		},

		/**
		 * Sets the default page upon loading of the create request page
		 * @private
		 */
		_fnSetDefaultPage: function () {
			var oNavContainer = this.byId("EditContainer");
			oNavContainer.to(this.getView().byId("editPage"));
		},

		/*
		 * function to update Package titles
		 */
		_fnUpdatePackageTitle: function (aItems) {
			var i18n = this.getResourceBundle();
			for (var i = 0; i <= aItems.length; i++) {
				if (aItems.hasOwnProperty(i)) {
					aItems[i].PackageNo = i18n.getText("PackageNoTtl", ("0" + (i + 1)).slice(-2));
				}
			}
		},

		/*
		 * Populate address and contact details from the selected location
		 * @param {String} sPath contains the item path
		 * @param {String} sAddressType contains the path for loacation
		 * @param {Array} aItemData contains the details of the pakcages
		 * @param {object} Return promisse solve with empty parameter
		 * @private
		 */
		_fnPopulateAddress: function (oDetails, sPath, sAddressType) {
			this._itemModel.setProperty(sPath + "/" + sAddressType + "UnitNo", oDetails.UnitNum);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "HouseNo", oDetails.HouseNum);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "Street", oDetails.Street);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "Subdivision", oDetails.Subdivision);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "Area", oDetails.Area);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "ProvinceDesc", oDetails.ProvinceDesc);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "CityDesc", oDetails.CityDesc);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "BarangayDesc", oDetails.BarangayDesc);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "Province", oDetails.ProvinceCode);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "City", oDetails.CityCode);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "Barangay", oDetails.Barangay);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "Zipcode", oDetails.ZipCode);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "ContactPerson", oDetails.ContactPerson);
			this._itemModel.setProperty(sPath + "/" + sAddressType + "ContactNumber", oDetails.ContactNumber.replaceAll(" ", ""));
			this._itemModel.setProperty(sPath + "/" + sAddressType + "ContactEmail", oDetails.ContactEmail);
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
		 * @param {object} oData Contains the response from backend
		 * @return {object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnProcessFreightCost: function (oData) {
			var aItems = this._itemModel.getData();
			var oBatchResponse = oData.__batchResponses[0]; //there will always one batchresponse
			aItems.forEach(function (oItem, iIndex) {
				if (oBatchResponse.hasOwnProperty("data") && oBatchResponse.data.results.length > 0) {
					oBatchResponse.data.results.forEach(function (oResults) {
						if (oResults.PackageNo === oItem.PackageNo) {
							aItems[iIndex].EstimatedCost = oResults.FreightCost;
							return;
						}
					});
				}
			});
			this._itemModel.refresh(true);
			return Promise.resolve();
		},

		/**
		 * Process Courier Data
		 * @param {object} oData Contains the response from backend
		 * @return {object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnProcessCouriers: function (oData) {
			var aItems = this._itemModel.getData();
			var oBatchResponse = oData.__batchResponses[0]; //there will always one batchresponse
			aItems.forEach(function (oItem, iIndex) {
				var aCouriers = [];
				if (oBatchResponse.hasOwnProperty("data") && oBatchResponse.data.results.length > 0) {
					oBatchResponse.data.results.forEach(function (oResult) {
						if (oResult.PackageNo === oItem.PackageNo) {
							aCouriers.push(oResult);
						}
					});
				}
				aItems[iIndex].ValueHelps.Courier = aCouriers;
			});
			this._itemModel.refresh(true);
			return Promise.resolve();
		},

		/**
		 * Computes the total shipment cost of the request
		 * @private
		 */
		_fnComputeTotalEstimatedCost: function () {
			var aItem = this._itemModel.getData();
			var iEstimatedCost = 0;

			aItem.forEach(function (oItem) {
				iEstimatedCost = iEstimatedCost + parseFloat(oItem.EstimatedCost);
			});
			this._requestHeaderModel.setProperty("/TotalEstimatedCost", iEstimatedCost.toString());
		},

		/**
		 * Crate a deep request for header and line items
		 * @param {boolean} isDraft Contains save type true = save as draft false = submit
		 * @return {object} Returns Promise resolve with payload as parameter
		 * @private
		 */
		_fnRequestHeaderItems: function (isDraft) {
			var oPayload = this._fnBuildPayload(isDraft);
			this.setBusyDialogOn();
			this.getView().getModel().create("/OLHeaderSet", oPayload, {
				groupId: Constants.ODATA_GROUP_ID
			});
			return Promise.resolve(oPayload);
		},

		/**
		 * Build the deep structure for submit/save request
		 * @param {boolean} isDraft Contains save type true = save as draft false = submit
		 * @return {object} Returns Deep structured payload
		 * @private
		 */
		_fnBuildPayload: function (isDraft) {
			var oPayload = {};
			var aItemData = JSON.parse(this._itemModel.getJSON());
			var oUser = this.getOwnerComponent().getModel("UserType").getData();
			oPayload = JSON.parse(this._requestHeaderModel.getJSON());
			// Start of insert MS223343 - PAL-2023-002
			delete oPayload.TruckTypeVisibility;
			// End of insert MS223343 - PAL-2023-002

			//remove unnecesarry data
			for (var i = 0; i <= aItemData.length; i++) {
				if (aItemData.hasOwnProperty(i)) {
					// Format UTC Date
					aItemData[i].DeliveryDate = Formatter.formatUTC(new Date(aItemData[i].DeliveryDate));
					aItemData[i].PickupDate = Formatter.formatUTC(new Date(aItemData[i].PickupDate));
					// Format Time
					aItemData[i].DeliveryTime = Formatter.formatDateToTime(new Date(aItemData[i].DeliveryTime));
					aItemData[i].PickupTime = Formatter.formatDateToTime(new Date(aItemData[i].PickupTime));
					delete aItemData[i].ValueHelps;
					delete aItemData[i].bShowDetails;
					delete aItemData[i].bPickupCopied;
					delete aItemData[i].bDeliveryCopied;
					delete aItemData[i].PackageNo;
				}
			}
			oPayload.StatusId = this._fnFormatStatus(isDraft, oUser.UserType, oPayload.TransType);
			oPayload.NAV_OLHeader_Item = aItemData;
			return oPayload;
		},

		/**
		 * Returns the Status ID of the submit button
		 * @param {boolean} isDraft Contains the method of saving draft = true else false
		 * @param {string} UserType Contains the type or user
		 * @param {string} sTransType Contains the transaction type 
		 * @return {string} Returns Status ID
		 * @private
		 */
		_fnFormatStatus: function (isDraft, UserType, sTransType) {
			if (isDraft) { //Draft
				return Constants.STATUS_DRAFT;
			} else if (sTransType === Constants.TRANS_TYPE_DOCUMENT) { //Submitted - Document
				return Constants.STATUS_SUBMIT_DOCUMENT;
			} else { //Submitted - Trade/Non-Trade
				return UserType === Constants.USER_TYPE_REGULAR ? Constants.STATUS_SUBMIT_REGULAR : Constants.STATUS_SUBMIT_PREAPPROVED;
			}
		},

		/**
		 * Event handler to send an attachment as a separate request.
		 * @param {object} oData Contains the return payload object from CREATE DEEP entity
		 * @private
		 */
		_fnCheckAttachments: function (oData) {
			return new Promise(function (fnResolve, fnReject) {
				var oPayloadReturn = oData.__batchResponses[0].__changeResponses[0].data;
				var oAttachmentModel = this.getView().getModel("Attachment");
				var aAttachment = oAttachmentModel.getData();

				// Check if attachment has data. Otherwise, dislay a success message.
				if (aAttachment.length > 0) {
					this._fnRequestAttachment(oData)
						.then(this.fnSubmitRequests.bind(this))
						.then(this.fnSuccessSubmit.bind(this))
						.then(this._fnShowSuccessRequestMsg.bind(this, oData))
						.catch(this._fnCatchRequestErrorAttachment.bind(this, oPayloadReturn));
				} else {
					this._fnShowSuccessRequestMsg(oData);
				}
			}.bind(this));
		},

		/**
		 * Request a Batch for Mutiple attachments (Defferred Mode).
		 * @param {object} oData Contains the details of the attachment
		 * @private
		 */
		_fnRequestAttachment: function (oData) {
			return new Promise(function (fnResolve, fnReject) {
				var aPromises = [];
				var oCreatedData = oData.__batchResponses[0].__changeResponses[0].data;
				var aIds = oCreatedData.RefNos.split(",");
				var oModel = this.getView().getModel("Attachment");
				var aAttachments = oModel.getData();

				aIds.forEach(function (oId) { //attach document on each created record
					aAttachments.forEach(function (oItem) {
						aPromises.push(new Promise(function (resolve, reject) {
							this.fnReadAttachment(oItem)
								.then(this.fnBuildBase64Attchment.bind(this, oItem))
								.then(this.fnRequestAttachment.bind(this, oItem, oId, "/AttachmentSet"))
								.then(function () {
									// Resolve Inner Request Promise per file read.
									resolve();
								});
						}.bind(this)));
					}.bind(this));
				}.bind(this));

				// Resolve Outer Promise
				Promise.all(aPromises).then(function () {
					fnResolve(aAttachments);
				});
			}.bind(this));
		},
		/**
		 * Callback function, after a success submission.
		 * It displays a confirmation message and a routing to home page.
		 * @param {object} oData Contains the newly created entry if it is provided by the backend.
		 * @private
		 */
		_fnShowSuccessRequestMsg: function (oData) {
			var i18n = this.getResourceBundle();
			var sMsgTitle = this._isDraft ? "successSaveDraftTitle" : "successSaveSubmitTitle";
			var sMsgText = "";
			var oPayload = oData.__batchResponses[0].__changeResponses[0].data;

			var aIds = oPayload.RefNos.split(",");
			sMsgText = aIds.length > 1 ? "successSavePluralContentText" : "successSaveSingleContentText";

			this.setBusyDialogOff();
			this.fnRemoveMessageManager();

			this.showDialog({
				title: i18n.getText(sMsgTitle),
				msg: i18n.getText(sMsgText, oPayload.RefNos)
			}).then(this.fnNavigateTo.bind(this, Constants.ROUTE_REPORT));
		},

		/**
		 * Event handler to trigger a DELETE request when attachment request failed.
		 * @param {object} oPayload Contains the payload of attachment request
		 * @param {string} sError Contains error in string format.
		 * @private
		 */
		_fnCatchRequestErrorAttachment: function (oPayload, sError) {
			// Check if there is an ID created
			if (oPayload) {
				// Execute delete of Header, if an error is encoutered during submission of attachment.
				this._fnRequestDeleteCreatedDTDs(oPayload)
					.then(this.fnSubmitRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this.fnCatchError.bind(this, sError));
			}
		},

		/**
		 * Request deletion of all the created records
		 * @param {object} oPayload Contains the payload of attachment request
		 * @return {object} Returns Promise resolve with no parameter
		 * @private
		 */
		_fnRequestDeleteCreatedDTDs: function (oPayload) {
			if (oPayload.hasOwnProperty("RefNos")) {
				var aIds = oPayload.RefNos.split(",");
				aIds.forEach(function (oId) {
					this.fnRequestDeleteDTD({
						RefNo: oId
					});
				}.bind(this));
			}
			return Promise.resolve();
		}

	});
});