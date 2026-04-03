function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZSSD_ONELOOK_BULK_UPLD_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}