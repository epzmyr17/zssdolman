sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/globe/OneLook_CreateDTDRequest/model/Constants"
], function (JSONModel, Device, Constants) {
	"use strict";

	/**
	 * Module for handling data model.
	 * @exports com.globe.OneLook_CreateDTDRequest.model.models
	 * @author Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 */
	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		/**
		 * Initial local model for the create dtd controller.
		 * @return {sap.ui.model.json.JSONModel} Returns json data for create DTD.
		 * @public
		 */
		createItemsModel: function (oResourceBundle, iPackageCount, dDate) {
			var dCurrentDate = new Date(dDate);
			var dNextDay = new Date(dCurrentDate.setDate(dCurrentDate.getDate() + 1));
			var oData = {
				"PackageNo": oResourceBundle.getText("PackageNoTtl", iPackageCount),
				"bShowDetails": true,
				"bPickupCopied": false,
				"bDeliveryCopied": false,
				"ItemType": "",
				"ItemTypeDesc": "",
				"ItemDescription": "",
				"Quantity": "",
				"Length": "",
				"Width": "",
				"Height": "",
				"Weight": "",
				"Currency": "PHP",
				"Amount": "0.00",
				"AssetNo": "",
				"SerialNo": "",
				"MaterialDoc": "",
				"EstimatedCost": "0",
				"Courier": "",
				// Start of insert MS223343 - PAL-2023-002
				"ManpowerServices": false,
				"Manpower": "",
				"CratingServices": false,
				"Crate": "",
				// End of insert MS223343 - PAL-2023-002
				//Trade
				"MaterialCode": "",
				"MaterialType": "",
				"MaterialTypeDesc": "",
				//Pickup Details
				"PickupDate": dNextDay,
				"PickupTime": dNextDay,
				"DeliveryType": "",
				"DeliveryTypeDesc": "",
				"PickupOrigin": "",
				"PickupOriginDesc": "",
				"PickupLocation": "",
				"PickupLocationDesc": "",
				"PickupUnitNo": "",
				"PickupHouseNo": "",
				"PickupStreet": "",
				"PickupSubdivision": "",
				"PickupArea": "",
				"PickupProvince": "",
				"PickupCity": "",
				"PickupBarangay": "",
				"PickupZipcode": "",
				"PickupSpecLoc": "",
				"PickupContactPerson": "",
				"PickupContactNumber": "",
				"PickupContactEmail": "",
				"PickupAltContactPerson": "",
				"PickupAltContactNumber": "",
				"PickupAltContactEmail": "",
				//Delivery Details
				"DeliveryOrigin": "",
				"DeliveryOriginDesc": "",
				"DeliveryLocation": "",
				"DeliveryLocationDesc": "",
				"TransportMode": "",
				"TransportModeDesc": "",
				"DeliveryUnitNo": "",
				"DeliveryHouseNo": "",
				"DeliveryStreet": "",
				"DeliverySubdivision": "",
				"DeliveryArea": "",
				"DeliveryProvince": "",
				"DeliveryCity": "",
				"DeliveryBarangay": "",
				"DeliveryZipcode": "",
				"DeliveryDate": dNextDay,
				"DeliveryTime": dNextDay,
				"ContainerType": "",
				"ContainerTypeDesc": "",
				"TruckType": "",
				"TruckTypeDesc": "",
				"DeliverySpecLoc": "",
				"DeliveryContactPerson": "",
				"DeliveryContactNumber": "",
				"DeliveryContactEmail": "",
				"DeliveryAltContactPerson": "",
				"DeliveryAltContactNumber": "",
				"DeliveryAltContactEmail": "",
				"ValueHelps": {
					"Delivery": {
						"Location": [],
						"Barangay": [],
						"City": [],
						"Province": []
					},
					"Pickup": {
						"Location": [],
						"Barangay": [],
						"City": [],
						"Province": []
					},
					"Courier": []

				}
			};
			return oData;
		},

		/**
		 * Initial local model for value help of dtd item.
		 * @return {object} Returns a value help object inside dtd item.
		 * @public
		 */
		createValueHelpItem: function () {
			var oData = {
				"Delivery": {
					"Location": [],
					"Barangay": [],
					"City": [],
					"Province": []
				},
				"Pickup": {
					"Location": [],
					"Barangay": [],
					"City": [],
					"Province": []
				},
				"Courier": []
			};

			return oData;
		},

		/**
		 * Initial local model for the create dtd controller.
		 * @param {String} sRequestType Contains the transaction type
		 * @param {String} sAccountType Contains the Account type for trade request.
		 * @param {String} sStatusId Contains the status id.
		 * @return {sap.ui.model.json.JSONModel} Returns json model for create view model.
		 * @public
		 */
		createViewModel: function (sRequestType, sAccountType, sStatusId) {
			return new JSONModel({
				Title: "",
				TransactionType: sRequestType || "",
				AccountType: sAccountType || "",
				PackageCount: 1,
				MinDate: new Date(),
				StatusId: sStatusId || ""
			});
		},

		/**
		 * Initial local model for the create dtd controller.
		 * @param {String} sTransType Contains the transaction type
		 * @param {String} sAccountType Contains the account type for trade request
		 * @return {sap.ui.model.json.JSONModel} Returns json model for create header model.
		 * @public
		 */
		createHeaderModel: function (sTransType, sAccountType) {
			var oData = {
				"TransType": sTransType,
				"AccountType": sAccountType,
				"Instructions": "",
				"TotalEstimatedCost": "0",
				"WbsCode": "",
				"CostCenter": "",
				"CompanyCode": "",
				"CompanyDesc": "",
				//Trade fields
				"PaymentMode": sTransType === Constants.TRANS_TYPE_TRADE ? Constants.PAYMENT_MODE_OTH : "",
				"Cashout": "0.00", // default to 0
				"CashoutCurrency": sTransType === Constants.TRANS_TYPE_TRADE ? "PHP" : "",
				"PaymentModeIndex": 0, //default to first index,
				// "Company": "",
				"ChannelId": "",
				"SegmentOrder": "",
				// "SegmentOrderDesc": "",
				"SegmentOrderType": "",
				// "SegmentOrderTypeDesc": "",
				"Activity": "",
				// "ActivityDesc": "",
				"BssCase": "",
				"DeliveryOrder": "",
				"AccountNo": "",
				"RecipientName": "",
				"MobileNo": "",
				"SubscriberName": "",
				"Approver": "",
				"Sto": "",
				"ReservationNo": ""
			};
			return new JSONModel(oData);
		},

		/**
		 * Initial local model for bulk request.
		 * @return {sap.ui.model.json.JSONModel} Returns local JSON Model for Bulk Create request.
		 * @public
		 */
		createBulkRequestModel: function () {
			var oPayload = {
				Approver: "",
				ApproverEmail: "",
				BulkTemplateText: "",
				BulkTemplateFile: [],
				SupportingDocs: [],
				TransType: ""
			};

			return new JSONModel(oPayload);
		},

		/**
		 * Initial local model for report tabs.
		 * @return {sap.ui.model.json.JSONModel} Returns local JSON Model for Report page.
		 * @public
		 */
		createReportTabModel: function () {
			// TODO: This should be included in F4Help service
			var oPayload = [{
				id: "00",
				description: "For action"
			}, {
				id: "03",
				description: "For approval"
			}, {
				id: "04",
				description: "For processing"
			}, {
				id: "05",
				description: "Completed"
			}];
			return new JSONModel(oPayload);
		},

		/**
		 * Initial local model for the report filter.
		 * @return  {sap.ui.model.json.JSONModel} Returns local JSON Model for Report filter.
		 * @public
		 */
		createReportFilterModel: function () {
			var oPayload = {
				Recnum: null,
				FromDate: null,
				ToDate: null,
				Status: null,
				TransType: null,
				BssCase: null,
				Sto: null,
				DeliveryOrder: null,
				sortType: false, // If false, sort is desc, else sort is asc.
			};
			return new JSONModel(oPayload);
		},

		/**
		 * Initial local model for the config.
		 * @return {sap.ui.model.json.JSONModel} Returns local JSON Model for Report page.
		 * @public
		 */
		createViewConfigModel: function () {
			var oPayload = {
				Editable: false,
				CurrentRoute: null,
				ActionEditable: true,
				Recnum: null,
				Busy: false,
				BusyDelay: 0
			};
			return new JSONModel(oPayload);
		},

		/**
		 * Initial local model for courier rating
		 * @param {string} sRecnum Contains the record number of the dtd request
		 * @return {sap.ui.model.json.JSONModel} Returns local JSON Model for Report page.
		 * @public
		 */
		createCourierRatingModel: function (sRecnum) {
			var oPayload = {
				RefNo: sRecnum,
				Remarks: "",
				CourierRate: 0
			};
			return new JSONModel(oPayload);
		}
	};
});