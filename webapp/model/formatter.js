sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/model/Constants"
], function (Constants) {
	"use strict";

	/**
	 * Module for handling complex logic for formatting properties or data.
	 * @exports com.globe.OneLook_CreateDTDRequest.model.formatter
	 * @author Mhia Cruz (MS210335)
	 * @since 1.0.0
	 * @version 1.0.0
	 */
	return {
		/**
		 * Converts date into UTC format.
		 * @param {date} dParam Contains Date
		 * @return {date} Returns date in UTC format.
		 * @public
		 */
		formatUTC: function (dParam) {
			return new Date(Date.UTC(dParam.getFullYear(), dParam.getMonth(), dParam.getDate()));
		},

		/**
		 * Returns package count text
		 * @param {Integer} iCount Contains a count of packages
		 * @return {String} Returns title of the package
		 * @public
		 */
		formatPackageCount: function (iCount) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			if (parseInt(iCount, 10) === 1) {
				return i18n.getText("NoOfPackage", iCount);
			} else {
				return i18n.getText("NoOfPackages", iCount);
			}
		},

		/**
		 * Returns package count text
		 * @param {Array} aItems Contains a item details
		 * @return {String} Returns title of the package
		 * @public
		 */
		formatPackageNumber: function (aItems) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			if (aItems.length === 1) {
				return i18n.getText("NoOfPackage", aItems.length);
			} else {
				return i18n.getText("NoOfPackages", aItems.length);
			}
		},

		/**
		 * Returns 
		 * @param {String} sTransType contains transaction type
		 * @return {String} returns a formatted Create request title.
		 * @public
		 */
		formatRequestTitle: function (sTransType) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aMapping = {
				"NT": "NonTrade",
				"TT": "Trade",
				"DT": "Document"
			};
			return i18n.getText("SingleCreateRequest", i18n.getText(aMapping[sTransType]));
		},

		/**
		 * Return bulk request title according to transaction type.
		 * @param {String} sTransType Contains transaction type
		 * @return {String} Returns a formatted Create bulk request title.
		 * @public
		 */
		formatBulkRequestTitle: function (sTransType) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aMapping = {
				"NT": "NonTrade",
				"TT": "Trade",
				"DT": "Document"
			};
			return i18n.getText("BulkCreateRequest", i18n.getText(aMapping[sTransType]));
		},

		/**
		 * Converts date into MM/dd/YYYY format.
		 * @param {date} oDate Contains Date
		 * @return {date} Returns date in MM/dd/YYYY format.
		 * @public
		 */
		formatDate: function (oDate) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MM/dd/yyyy"
			});
			if (oDate !== "") {
				return oDateFormat.format(oDate);
			} else {
				return "";
			}
		},

		/**
		 * Converts date into HH:mm format.
		 * @param {date} oDate Contains Date
		 * @return {date} Returns date in HH:mm format.
		 * @public
		 */
		formatTime: function (oDate) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "HH:mm"
			});
			if (oDate !== "") {
				return oDateFormat.format(oDate);
			} else {
				return "";
			}
		},

		/**
		 * Converts date into "PTHH'H'mm'M'ss'S'" format.
		 * @param {date} oDate Contains Date
		 * @return {date} Returns date in "PTHH'H'mm'M'ss'S'" format.
		 * @public
		 */
		formatDateToTime: function (oDate) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "PTHH'H'mm'M'ss'S'"
			});

			if (oDate !== "") {
				return oDateFormat.format(oDate);
			} else {
				return "";
			}
		},

		/**
		 * Converts time("PTHH'H'mm'M'ss'S'") to date format.
		 * @param {int} iMilliSec Contains milliseconds
		 * @return {date} Returns date in format.
		 * @public
		 */
		formatMilSecToDate: function (iMilliSec) {
			if (iMilliSec !== "") {
				var iTZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				return new Date(iMilliSec + iTZOffsetMs);
			} else {
				return "";
			}
		},

		/**
		 * Returns icon uri based on mode of transport
		 * @param {string} sTransportMode Contains mode of transport
		 * @return {string} Returns uri of the icon
		 * @public
		 */
		formatTransportModeIcon: function (sTransportMode) {
			var oMapping = {
				"AIR": "sap-icon://flight",
				"LAND": "sap-icon://shipping-status",
				"RORO": "sap-icon://shipping-status",
				"SEA": "sap-icon://sap-box"
			};

			return oMapping[sTransportMode];
		},

		/**
		 * Returns delivery details
		 * @param {string} sDeliveryType Contains delivery type
		 * @param {string} sTransportMode Contains mode of transport
		 * @return {string} Returns delivery details
		 * @public
		 */
		formatDeliveryDetails: function (sDeliveryType, sTransportMode) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			return i18n.getText("DeliveryDetails", [sDeliveryType, sTransportMode]);
		},

		/**
		 * Returns a formatted file size in different size: Bytes, KB, MB, GB, TB and PB
		 * @param {byte} bytes Contains integer value.
		 * @return {string} Returns a formatted file size.
		 * @public
		 */
		fnFormatBytes: function (bytes) {
			var iDecimal = 2;
			if (bytes == 0) {
				return "0 Byte";
			}
			var k = 1024; //Or 1 kilo = 1000
			var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
			var i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(iDecimal)) + " " + sizes[i];
		},

		/**
		 * Returns an sap icon text based from mime type of a file.
		 * @param {string} sMimeType Contains mime type string.
		 * @return {string} Returns an sap icon text
		 * @public
		 */
		fnFormatFileIcon: function (sMimeType) {
			var oMimeType = {
				"application/pdf": "sap-icon://pdf-attachment",
				"image/png": "sap-icon://attachment-photo",
				"image/jpeg": "sap-icon://attachment-photo",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sap-icon://excel-attachment",
				"application/vnd.ms-excel": "sap-icon://excel-attachment",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "sap-icon://doc-attachment",
				"application/msword": "sap-icon://doc-attachment",
				"application/zip": "sap-icon://attachment-zip-file",
				"application/x-zip-compressed": "sap-icon://attachment-zip-file"
			};
			return oMimeType[sMimeType];
		},

		/**
		 * Returns an sap icon text based from mime type of a file.
		 * @param {array} aAttachment Contains the attached files
		 * @return {string} Returns the attachemnt title
		 * @public
		 */
		formatAttachemntCount: function (aAttachment) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return i18n.getText("attachmentCount", aAttachment.length ? aAttachment.length : "0");
		},
		/**
		 * Returns additional required details to be filled out
		 * @param {String} sTransType contains transaction type
		 * @param {String} sUserType contains the user Type (Regular/Pre-approved)
		 * @return {String} returns a formatted amoount label
		 * @public
		 */
		formatRequiredAdditionalDetails: function (sTransType, sUserType) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aMapping = {
				"NT": sUserType === Constants.USER_TYPE_REGULAR ? "NonTradeRequiredInformation" : "NonTradeRequiredInformationPA",
				"TT": sUserType === Constants.USER_TYPE_REGULAR ? "TradeRequiredInformation" : "TradeRequiredInformationPA",
				"DT": "DocumentRequiredInformation"
			};
			return i18n.getText(aMapping[sTransType]);
		},

		/**
		 * Returns formatter amount label based on transaction type
		 * @param {String} sTransType contains transaction type
		 * @return {String} returns a formatted amount label
		 * @public
		 */
		formatAmountText: function (sTransType) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aMapping = {
				"NT": "DeclaredValueLbl",
				"DT": "DeclaredValueLbl",
				"TT": "Amount"
			};
			return i18n.getText(aMapping[sTransType]);
		},

		/**
		 * Returns 'none' if there is no value
		 * @param {String} sValue Contains the field value
		 * @return {String} returns a formatted value
		 * @public
		 */
		formatValue: function (sValue) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return sValue ? sValue : i18n.getText("None");
		},

		/**
		 * Returns 'none' if there is no value
		 * @param {String} sValue Contains the field value
		 * @return {String} returns a formatted value
		 * @public
		 */
		formatNumberValue: function (sValue) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return sValue ? i18n.getText("MobilePHAlias") + sValue : i18n.getText("None");
		},

		/** 
		 * Returns max length in interger
		 * @param {string} sMaxLength Metadata maxlength.
		 * @returns {int} Formatted maxlength.
		 * @public
		 */
		fnGetMaxLength: function (sMaxLength) {
			var sTemp = sMaxLength;
			var iParsed = parseInt(sTemp, 10);

			// failsafe
			if (isNaN(iParsed)) {
				return 40;
			}

			return iParsed;
		},

		/** 
		 * Formats string to interger
		 * @param {string} sMaxLength Metadata maxlength.
		 * @returns {int} Formatted maxlength.
		 * @public
		 */
		formatStringToInt: function (sValue) {
			return isNaN(parseInt(sValue, 10)) ? 0 : parseInt(sValue, 10);
		},

		/**
		 * Format index no.
		 * @param {int} iIndex Contains the index no.
		 * @return {string} Returns formatterd index no.
		 * @public
		 */
		formatBulkDocItemNo: function (iIndex) {
			return (iIndex + 1) + "0";
		},

		/**
		 * Package Title details in the review page
		 * @param {int} iPackageNo Contains the Package number.
		 * @param {string} sItemType Contains the Item Type.
		 * @param {string} sMaterialType Contains the Material Type.
		 * @param {string} sTransType Contains the Transaction Type.
		 * @return {string} Returns formatted Package title details.
		 * @public
		 */
		formatPackageItemDetails: function (iPackageNo, sItemType, sMaterialType, sTransType) {
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return i18n.getText("PackageTitle", [iPackageNo, sTransType === Constants.TRANS_TYPE_TRADE ? sMaterialType : sItemType]);
		},

		// Start of insert MS223343 - PAL-2023-002
		/**
		 * Compute volume
		 * @param {int} iLength Contains the length.
		 * @param {int} iWidth Contains the width.
		 * @param {int} iHeight Contains the height.
		 * @public
		 */
		formatCubicMeter: function (iLength, iWidth, iHeight) {
			var volume = 0;
			if (iLength && iWidth && iHeight) {
				volume = Number(iLength) * Number(iWidth) * Number(iHeight) * 0.000001;
			}
			return volume.toFixed(3);
		},

		// Start of change MS223343 - PAL-2023-004 / 007
		formatVolumeMetricWeight: function (iLength, iWidth, iHeight) {
			var volume = 0;
			if (iLength && iWidth && iHeight) {
				volume = (Number(iLength) * Number(iWidth) * Number(iHeight)) / 3500;
			}
			return volume.toFixed(3);
		},
		// End of change MS223343 - PAL-2023-004 / 007

		/**
		 * @param {string} sManpower Contains the manpower.
		 * @public
		 */
		formatManpower: function (sManpower) {
				var count = 0;
				if (sManpower) {
					count = Number(sManpower);
				}
				return count;
			}
			// End of insert MS223343 - PAL-2023-002
	};
});