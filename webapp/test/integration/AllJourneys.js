/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"com/globe/ph/create/dtd/request/dtdCreateRequest/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/globe/ph/create/dtd/request/dtdCreateRequest/test/integration/pages/dashboard",
	"com/globe/ph/create/dtd/request/dtdCreateRequest/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.globe.ph.create.dtd.request.dtdCreateRequest.view.",
		autoWait: true
	});
});