sap.ui.define([],
	function () {
		'use strict';
		var Constants = {
			/**
			 * Max DTD Item
			 */
			CREATE_DTD_MAX_ITEM: 10,

			/**
			 * Maxlength of email address
			 */
			EMAIL_MAXLENGTH: 100,

			/**
			 * Route for Dashboard Page
			 */
			ROUTE_DASHBOARD: "Dashboard",

			/**
			 * Route for Report Page
			 */
			ROUTE_REPORT: "Report",

			/**
			 * Route for View Request Page
			 */
			ROUTE_VIEW_REQUEST: "ViewRequest",

			/**
			 * Route for Edit Request Page
			 */
			ROUTE_EDIT_REQUEST: "EditRequest",

			/**
			 * Route for Create Bulk Request
			 */
			ROUTE_CREATE_BULK_REQUEST: "CreateBulkRequest",

			/**
			 * Default Report Tab - 00 = For action
			 */
			REPORT_DEFAULT_TAB: "T1",

			/**
			 * Report Status Draft
			 */
			REPORT_STATUS_DRAFT: "S01",
			/**
			 * Report Status Returned
			 */
			REPORT_STATUS_RETURNED: "S02",

			/**
			 * Status = Draft
			 */
			STATUS_DRAFT: "S01",

			/**
			 * Status = Returned
			 */
			STATUS_RETURNED: "S02",

			/**
			 * Status = Submitted / penidng approval
			 */
			STATUS_SUBMIT_REGULAR: "S03",

			/**
			 * Status = Submitted / submitted to courier
			 */
			STATUS_SUBMIT_PREAPPROVED: "S05",

			/**
			 * Status = Submitted / submitted to courier
			 */
			STATUS_SUBMIT_DOCUMENT: "S05",

			/**
			 * Pickup location = Warehouse
			 */
			PICKUP_LOC_WAREHOUSE: "W",

			/**
			 * transaction type = Non trade
			 */
			TRANS_TYPE_NON_TRADE: "NT",

			/**
			 * transaction type = Trade
			 */
			TRANS_TYPE_TRADE: "TT",

			/**
			 * transaction type = Document
			 */
			TRANS_TYPE_DOCUMENT: "DT",

			/**
			 * Input type = email
			 */
			INPUT_TYPE_EMAIL: "Email",

			/**
			 * Input type = nnumber
			 */
			INPUT_TYPE_NUMBER: "Number",

			/**
			 * odata  group id
			 */
			ODATA_GROUP_ID: "REQUESTOR_APP_ID",

			/**
			 * location: delivery
			 */
			LOCATION_DELIVERY: "Delivery",

			/**
			 * location: pickup
			 */
			LOCATION_PICKUP: "Pickup",

			/**
			 * delivery: date
			 */
			DELIVERY_DATE: "DeliveryDate",

			/**
			 * delivery: time
			 */
			DELIVERY_TIME: "DeliveryTime",

			/**
			 * pickup: date
			 */
			PICKUP_DATE: "PickupDate",

			/**
			 * pickup: time
			 */
			PICKUP_TIME: "PickupTime",

			/**
			 * Save type: draft
			 */
			SAVE_DRAFT: "Draft",

			/**
			 * Mode of transport: Land
			 */
			MODE_OF_TRANSPORT_LAND: "LAND",

			/**
			 * Mode of transport: RORO
			 */
			MODE_OF_TRANSPORT_RORO: "RORO",

			// Start of insert MS223343 - PAL-2023-004 / 007
			/**
			 * Mode of transport: RORT
			 */
			MODE_OF_TRANSPORT_RORT: "RORT",
			// End of insert MS223343 - PAL-2023-004 / 007

			/**
			 * Mode of transport: Sea
			 */
			MODE_OF_TRANSPORT_SEA: "SEA",

			/**
			 * Error Severity: Warning
			 */
			ERROR_SEVERITY_WARNING: "warning",

			/**
			 * User type: Regular
			 */
			USER_TYPE_REGULAR: "R",

			/**
			 * User Type: Pre-approved
			 */
			USER_TYPE_PREAPPROVED: "PA",

			/**
			 * Value State: Error
			 */
			VALUE_STATE_ERROR: "Error",

			/**
			 * Value State: None
			 */
			VALUE_STATE_NONE: "None",

			/**
			 * Number type: Numeric
			 */
			NUMBER_TYPE_NUMERIC: "Numeric",

			/**
			 * Template URL for Bulk Template: Non-trade and Document
			 */
			BULK_TEMPLATE_URL_NONTRADE_DOC: "/sap/public/bc/OneLook/Bulk Template - Non-trade and Doc.xlsx",

			/**
			 * Template URL for Bulk Template: Trade
			 */
			BULK_TEMPLATE_URL_TRADE: "/sap/public/bc/OneLook/Bulk Template - Trade.xlsx",

			/**
			 * Upload type for bulk template
			 */
			UPLOAD_TYPE_BULK: "BT",

			/**
			 * Upload type for supporting docs
			 */
			UPLOAD_TYPE_SUPPORT_DOCS: "SD",

			/**
			 * OData model name for bulk
			 */
			ODATA_BULK_MODEL: "ZSSD_ONELOOK_BULK_UPLD_SRV",

			/**
			 * Business Readiness material URL.
			 */
			/* eslint-disable sap-no-hardcoded-url */
			BUSINESS_READINESS_MAT_URL: "https://drive.google.com/drive/folders/1GPq-jb8fFU4aK_XAiF0_hcysRSsfjR5R",

			/**
			 * Payment mode type - Others
			 */
			PAYMENT_MODE_OTH: 'CTB',

			/**
			 * Cashout default value
			 */
			CASHOUT_DEFAULT_VALUE: "0.00"
		};

		return Constants;
	});