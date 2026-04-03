sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {
		init: function () {
			this._fnMasterDataService();
			this._fnReportService();
		},

		_fnMasterDataService: function () {
			// create
			var oMockServer = new MockServer({
				// NOTE: SHOULD MATCH DATASOURCE/URI IN MANIFEST.JSON
				rootUri: "/sap/opu/odata/sap/ZSSD_ONELOOK_MDATA_SRV/"
			});

			var oUriParameters = jQuery.sap.getUriParameters();

			// configure mock server with a delay
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 500
			});

			// simulate
			var sPath = "../localService/ZSSD_ONELOOK_MDATA_SRV";
			oMockServer.simulate(sPath + "/metadata.xml", {
				sMockdataBaseUrl: sPath,
				bGenerateMissingMockData: true
			});

			// start
			oMockServer.start();
		},

		_fnReportService: function () {
			// create
			var oMockServer = new MockServer({
				// NOTE: SHOULD MATCH DATASOURCE/URI IN MANIFEST.JSON
				rootUri: "/sap/opu/odata/sap/ZSSD_ONELOOK_TRANS_SRV/"
			});

			var oUriParameters = jQuery.sap.getUriParameters();

			// configure mock server with a delay
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 500
			});

			// simulate
			var sPath = "../localService/ZSSD_ONELOOK_TRANS_SRV/";
			oMockServer.simulate(sPath + "/metadata.xml", {
				sMockdataBaseUrl: sPath,
				bGenerateMissingMockData: true
			});

			// start
			oMockServer.start();
		}
	};

});