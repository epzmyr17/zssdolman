sap.ui.define([
	"com/globe/OneLook_CreateDTDRequest/controller/BaseController",
	"com/globe/OneLook_CreateDTDRequest/model/Constants",
	"com/globe/OneLook_CreateDTDRequest/model/models",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Constants, Model, JSONModel) {
	"use strict";

	/**
	 * Create Bulk Request controller for the object header, and table layout.
	 * @class
	 * @extends com.globe.OneLook_CreateDTDRequest.controller.BaseController
	 * @constructor
	 * @public
	 * @author - Takao Baltazar (VE210015)
	 * @since 1.0.0
	 * @version 1.0.0
	 * @name com.globe.OneLook_CreateDTDRequest.controller.CreateBulkRequest
	 */
	return BaseController.extend("com.globe.OneLook_CreateDTDRequest.controller.CreateBulkRequest", /** @lends com.globe.OneLook_CreateDTDRequest.controller.CreateBulkRequest */ {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/** 
		 * Main entry point of the application. 
		 * Triggered for each route in the application lifecycle.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute(Constants.ROUTE_CREATE_BULK_REQUEST).attachPatternMatched(this.onRouteMatched, this);

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
		onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			var sRequestType = oArgs.RequestType;

			this.fnAttachedBulkDefferedModel();
			this._initializeModel(sRequestType);
			this._fnResetBatchNo();
			this.setBusyDialogOff();

			this.fnRemoveMessageManager();
			this.fnResetRequiredFieldStates(this.getView().byId("idBulkDynamicPage"), "NT");
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
		 * Event handler when download template is clicked for Non-trade and Document. Download template from MIME Repository.
		 */
		onDownloadTemplateNonTradeDoc: function () {
			sap.m.URLHelper.redirect(Constants.BULK_TEMPLATE_URL_NONTRADE_DOC, false);
		},

		/**
		 * Event handler when download template is clicked for Trade. Download template from MIME Repository.
		 */
		onDownloadTemplateTrade: function () {
			sap.m.URLHelper.redirect(Constants.BULK_TEMPLATE_URL_TRADE, false);
		},

		/**
		 * Event handler after selecting transaction type.
		 * @param {object} oEvent Contains event object of combo box.
		 */
		onSelectTransType: function (oEvent) {
			var sUserType = this.getView().getModel("UserType").getProperty("/UserType");

			if (sUserType === Constants.USER_TYPE_REGULAR && this._bulkRequestModel.getProperty("/TransType") === Constants.TRANS_TYPE_DOCUMENT) {
				this._bulkRequestModel.setProperty("/Approver", "");
				this._bulkRequestModel.setProperty("/ApproverEmail", "");
			}

			this._fnValidateFields(oEvent.getSource());
		},

		/**
		 * Event handler after selecting a file in bulk upload.
		 * @param {object} oEvent Contains event object of file uploader.
		 */
		onFileBulkSelect: function (oEvent) {
			var oFile = oEvent.getParameter("files")[0];
			if (oFile) {
				var oData = {
					FileName: oFile.name,
					file: oFile,
					FileSize: oFile.size,
					MimeType: oFile.type,
					Icon: this.formatter.fnFormatFileIcon(oFile.type),
					UploadType: Constants.UPLOAD_TYPE_BULK
				};
				// 1. Reset attachment, since we only accept single file.
				this._bulkRequestModel.setProperty("/BulkTemplateFile", [oData]);
				this._bulkRequestModel.refresh(true);

				// 2. Set value state
				oEvent.getSource().setValueState(Constants.VALUE_STATE_NONE);

				sap.m.MessageToast.show(this.getResourceBundle().getText("FileAdded"));
				return;
			}
			// If no file is selcted, clear model.
			this._bulkRequestModel.setProperty("/BulkTemplateFile", []);
			this._bulkRequestModel.refresh(true);
		},

		/**
		 * Event handler after selecting a file in file uploader control
		 * @param {object} oEvent Contains event object of file uploader.
		 */
		onFileSupportDocsSelect: function (oEvent) {
			var aAttachmentList = this._bulkRequestModel.getProperty("/SupportingDocs");
			var oFile = oEvent.getParameter("files")[0];
			var iIndexFound = -1;
			if (oFile) {
				var oData = {
					FileName: oFile.name,
					file: oFile,
					FileSize: oFile.size,
					MimeType: oFile.type,
					Icon: this.formatter.fnFormatFileIcon(oFile.type),
					UploadType: Constants.UPLOAD_TYPE_SUPPORT_DOCS
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
							this._bulkRequestModel.refresh(true);
						}.bind(this));
				} else {
					aAttachmentList.push(oData);
					this._bulkRequestModel.refresh(true);
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
			var oProp = this._bulkRequestModel.getProperty("/");
			var oItem = this._bulkRequestModel.getProperty(sPath);

			this.showMsgBoxConfirm(this.getResourceBundle().getText("confirmDeleteFile", [oItem.FileName]))
				.then(function () {
					oProp.SupportingDocs.splice(iIndexOfItem, 1);
					this._bulkRequestModel.setProperty("/", oProp);
					this._bulkRequestModel.refresh(true);
				}.bind(this));
		},

		/**
		 * Event handler when submit/save as draft is clicked
		 * @public
		 */
		onSubmit: function () {
			var oDynamicForm = this.getView().byId("idBulkDynamicPage");
			var sTransactionType = this.getModel("viewModel").getProperty("/TransactionType");

			// 1. Validate required fields
			var bIsValidated = this.fnValidateRequiredFields(oDynamicForm, sTransactionType);

			// 2. Send Request to header
			if (!bIsValidated) {
				this.setBusyDialogOn();
				this._fnProcessAttachments();
			} else {
				this.showMsgBoxError(this.getResourceBundle().getText("ValidationError"));
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Initializes all model
		 * @param {String} sRequestType constains the transaction type of the request
		 * @private
		 */
		_initializeModel: function (sRequestType) {
			this._viewModel = Model.createViewModel(sRequestType);
			this.getView().setModel(this._viewModel, "viewModel");

			this._bulkRequestModel = Model.createBulkRequestModel();
			this.getView().setModel(this._bulkRequestModel, "bulkRequestModel");
			this.getView().bindElement("bulkRequestModel>/");
		},

		/**
		 * Queue a batch request for Attachment (Deffered Mode).
		 * Mode: Create, Delete.
		 * Attachment Line Item
		 * @private
		 */
		_fnRequestFileLineItem: function (oParam) {
			return new Promise(function (fnResolve, fnReject) {
				var aPromises = [];
				var aAttachments = this._bulkRequestModel.getProperty(oParam.property);
				aAttachments.forEach(function (oItem, iIdx) {
					aPromises.push(new Promise(function (resolve, reject) {
						this.fnReadAttachment(oItem)
							.then(this.fnBuildBase64Attchment.bind(this, oItem))
							.then(this._fnBuildAttachmentPayload.bind(this, oItem, oParam.path, iIdx))
							.then(this.fnRequestBulkAttachment.bind(this))
							.then(function () {
								resolve();
							});
					}.bind(this)));
				}.bind(this));

				Promise.all(aPromises).then(function () {
					// Resolve Outer Promise
					fnResolve(aAttachments);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Queue a delete request for Header
		 * @private
		 */
		_fnRequestDeleteHeader: function () {
			var sKey = this._fnCreateBulkHeder("OLBulkHeaderSet");

			this.getView().getModel(Constants.ODATA_BULK_MODEL).remove("/" + sKey, {
				groupId: Constants.ODATA_GROUP_ID,
				refreshAfterChange: false
			});

			return Promise.resolve();
		},

		/**
		 * Queue a function import request to create a background job in S/4 hana to process the bulk template and attachment.
		 * @private
		 */
		_fnRequestFunctionImport: function (oConfig, oParam) {
			this.getView().getModel(Constants.ODATA_BULK_MODEL).callFunction(oConfig.path, {
				method: oConfig.method,
				groupId: Constants.ODATA_GROUP_ID,
				urlParameters: oParam
			});

			return Promise.resolve();
		},

		/**
		 * Build the payload for attachment.
		 * @param {object} oItem Contains item of attachment
		 * @param {string} sPath Contains the entity path
		 * @param {int} iIndex Contains the index no. of item
		 * @param {xstring} sBase64 Contains the base64 of file/attachment.
		 * @return {object} Returns Attachment structure payload.
		 * @private
		 */
		_fnBuildAttachmentPayload: function (oItem, sPath, iIndex, sBase64) {
			var oParam = this._bulkRequestModel.getProperty("/");
			var sSLug = null;

			if (oItem.UploadType === Constants.UPLOAD_TYPE_BULK) {
				// For Bulk template slug
				sSLug = [oParam.TransType, oParam.Approver, oParam.ApproverEmail, oItem.FileName, oItem.MimeType, oItem.FileSize,
					oItem.Icon
				];
			} else {
				// For Supporting docs slug
				sSLug = [this._batchNo, this._year, this.formatter.formatBulkDocItemNo(iIndex), oItem.FileName, oItem.MimeType, oItem.FileSize,
					oItem.Icon
				];
			}

			var oPayload = {
				base64: sBase64,
				path: sPath,
				slug: sSLug.join("|")
			};

			return oPayload;
		},

		/**
		 * Build the payload for function import
		 * @private
		 */
		_fnBuildFunctionImportPayload: function () {
			return {
				BatchNo: this._batchNo,
				BatchYear: this._year
			};
		},

		/**
		 * Event handler to send an attachment as a separate request for Supporting Docs and Bulk Template file.
		 * @private
		 */
		_fnProcessAttachments: function () {
			if (this._bulkRequestModel.getProperty("/SupportingDocs").length > 0) {
				// 1. Send request for Bulk template file and Supporting docs.
				this._fnRequestFileLineItem({
						property: "/BulkTemplateFile",
						path: "/OLBulkHeaderSet"
					})
					.then(this.fnSubmitBulkRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this._fnStoreBatchNo.bind(this))
					// 1.1 Send Request for Bulk template file
					.then(this._fnRequestFileLineItem.bind(this, {
						property: "/SupportingDocs",
						path: "/OLBulkAttachmentSet"
					}))
					.then(this.fnSubmitBulkRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this._fnBuildFunctionImportPayload.bind(this))
					.then(this._fnRequestFunctionImport.bind(this, {
						method: "POST",
						path: "/CreateDTDBulk"
					}))
					.then(this.fnSubmitBulkRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this._fnProcessSuccess.bind(this))
					.catch(this._fnCatchRequestErrorAttachment.bind(this));
			} else {
				// 2. Send Request for Bulk template file
				this._fnRequestFileLineItem({
						property: "/BulkTemplateFile",
						path: "/OLBulkHeaderSet"
					})
					.then(this.fnSubmitBulkRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this._fnStoreBatchNo.bind(this))
					.then(this._fnBuildFunctionImportPayload.bind(this))
					.then(this._fnRequestFunctionImport.bind(this, {
						method: "POST",
						path: "/CreateDTDBulk"
					}))
					.then(this.fnSubmitBulkRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this._fnProcessSuccess.bind(this))
					.catch(this._fnCatchRequestErrorAttachment.bind(this));
			}
		},

		/**
		 * Event handler to trigger a DELETE request when attachment request failed.
		 * @param {object} oPayload Contains the payload of attachment request
		 * @param {string} sError Contains error in string format.
		 * @private
		 */
		_fnCatchRequestErrorAttachment: function (sError) {
			// 1. Check if there is an ID
			if (this._batchNo && this._year) {
				// 1.1 Execute delete of Header, if an error is encoutered during submission of Supporting Docs / Bulk Template.
				this._fnRequestDeleteHeader()
					.then(this.fnSubmitBulkRequests.bind(this))
					.then(this.fnSuccessSubmit.bind(this))
					.then(this._fnResetBatchNo.bind(this))
					.then(this.fnCatchError.bind(this, sError));
			} else {
				this.fnCatchError(sError);
			}
		},

		/**
		 * Store batch no. globally after bulk template request.
		 * @param {object} oData Contains result from OData service request.
		 * @private
		 */
		_fnStoreBatchNo: function (oData) {
			// Get batch no. as reference for sending request to supporting docs and bulk template.
			this._batchNo = oData.__batchResponses[0].__changeResponses[0].data.BatchNo;
			this._year = oData.__batchResponses[0].__changeResponses[0].data.BatchYear;
		},

		/**
		 * Reset batch no. globally after delete of header request.
		 * @private
		 */
		_fnResetBatchNo: function () {
			this._batchNo = null;
			this._year = null;
		},

		/**
		 * Create OData key for Bulk Template service.
		 * @param {string} sPath Contains entity path.
		 * @private
		 */
		_fnCreateBulkHeder: function (sPath) {
			var sKey = this.getModel(Constants.ODATA_BULK_MODEL).createKey(sPath, {
				BatchNo: this._batchNo,
				BatchYear: this._year
			});

			return sKey;
		},

		/**
		 * Close busy dialog, reset control and models after a success request.
		 * @private
		 */
		_fnProcessSuccess: function () {
			// 1. Close dialog
			this.setBusyDialogOff();

			// 2. Show success msg
			this.showDialog({
					title: this.getResourceBundle().getText("successSaveSubmitTitle"),
					msg: this.getResourceBundle().getText("successSubmitBulkText")
				})
				.then(this.fnNavigateTo.bind(this, Constants.ROUTE_DASHBOARD));
		}
	});
});