# SD OneLook DTD Request

This application is a custom SAPUI5 application for OneLook DTD Request

## Application Information

Application for requestor to view and edit requests and create new request.

## Key Features
- View DTD Request
- Edit DTD Request
- Create DTD Request

## Technical Information

### SAPUI5 Application
The ICF nodes for the following SAPUI5 application must be activated on the front-end server:

| Component | Technical Name | Path to ICF Node | SAPUI5 Component |
| --- | --- | --- | --- |
| SAPUI5 Application | zssd_ol_man | /sap/bc/ui5_ui5/sap/zssd_ol_man | com.globe.OneLook_CreateDTDRequest |

### Git Repository
| Name | URL
| --- | --- |
| zssdolman  | https://git.ap1.hana.ondemand.com/zz1qtpwp2i/zssdolman |

### OData Services
The following OData services must be activated on the front-end server
Users require PFCG authorization for the front-end and back-end systems.

| OData Service | Authorization Role (PFCG) |
| --- | --- |
| ZSSD_ONELOOK_TRANS_SRV | /sap/opu/odata/sap/ZSSD_ONELOOK_TRANS_SRV/ |
| ZSSD_ONELOOK_MDATA_SRV | /sap/opu/odata/sap/ZSSD_ONELOOK_MDATA_SRV/ |

### SAP Fiori Launchpad
You require the following data to give users access to the app in the SAP Fiori launchpad.

#### Technical Configuration
| Field | Detail |
| --- | --- |
| Technical Catalog | ZSD_OL_CUSTOM_TC_CAT |
| Technical Catalog Description	| OneLook: All apps |
| SAPUI5 Application | zssd_ol_man |

#### Target Mapping(s)
| Semantic Object | Semantic Action | Parameter Key | Parameter Value |
| --- | --- | --- | --- |
| OneLookRequest | manage | | | |

#### Business Catalog(s)
| Catalog Name | Catalog Description | 
| --- | --- |
| ZSD_OL_REG_BC_CAT | Regular Requestor (OneLook) |
| ZSD_OL_IS_BC_CAT | IS Approver (OneLook) |
| ZSD_OL_FFP_BC_CAT | Admin/FFP (OneLook) |
| ZSD_OL_PA_CH_BC_CAT | Pre-approve - CHD(OneLook) |
| ZSD_OL_PA_MT_BC_CAT | Pre-approve - Marketing(OneLook) |
| ZSD_OL_PA_NG_BC_CAT | Pre-approve - NTG(OneLook) |
| ZSD_OL_PA_MG_BC_CAT | Pre-approve - NTMG(OneLook) |
| ZSD_OL_PA_SL_BC_CAT | Pre-approve - Spares Logistics(OneLook) |
| ZSD_OL_PA_SS_BC_CAT | Pre-approve - Store setup(OneLook) |
| ZSD_OL_REG_MRP_CAT | Mailroom Processor (OneLook) |
| ZSD_OL_WP_LEM_BC_CAT | Warehouse Processor - Lemcon(OneLook) |
| ZSD_OL_WP_SCH_BC_CAT | Warehouse Processor - Schenker(OneLook) |


#### Business Group(s)
| Business Group | Group Description |
| --- | --- |
| ZSD_ONELOOK_GRP | OneLook |

#### Business Role(s)
| Role Name | Role Description |
| --- | --- |
|  XC_FIORI_OL_REG |  Composite Role |
|  XC_FIORI_OL_IS |  Composite Role |
|  XC_FIORI_OL_SA |  Composite Role |
|  XC_FIORI_OL_FFP |  Composite Role |
|  XC_FIORI_OL_PASL |  Composite Role |
|  XC_FIORI_OL_PASS |  Composite Role |
|  XC_FIORI_OL_PAMG |  Composite Role |
|  XC_FIORI_OL_PANG |  Composite Role |
|  XC_FIORI_OL_PACH |  Composite Role |
|  XC_FIORI_OL_PAMT |  Composite Role |
|  XC_FIORI_OL_MRP |  Composite Role |
|  XC_FIORI_OL_LWP |  Composite Role |
|  XC_FIORI_OL_SWP |  Composite Role |

## Deployment Setup

Deploy to SAP Fiori Launchpad using SAP Web IDE.

## Authors

* Mhia Lorrained Cruz [@VE210015](mailto:mhia.cruz@globe.com.ph)
* Paul Baylas [@MS212205](mailto:paul.baylas@globe.com.ph)

## Release History

* 3.0.0
	* Handling of data relation for Mode of transport and Delivery type
	* New UI field to be shown specifically for Traded only, Store (Name, Address, Number)
	* New UI field to be shown specifically for Traded and Non-Traded only, Sloc (Issuing, Receiving)

* 2.0.0
	* New UI field to be shown specifically for Non-Trade only, Volumetric Weight
	* New UI field to be shown specifically for Non-Trade only, Chargeable Weight
	* Replace RORO Mode of Delivery to RORO – Normal & and add RORO – Truckload

* 1.2.8
	* Rearrange Cost center and Company
	* Cost center requires Company
	* Filter Cost center by Bukrs and Kostl
	* Change Cost center service
	* Display Cost center node
	* New field IO charging account
	* Clear courier if does not exist in serviceable

* 1.2.7
	* Adjust logic for when passing oda value to function import

* 1.2.6
	* Adjust RORO weight limit to 5000

* 1.2.5
	* Add switch for Manpower Services
	* Add combobox for Manpower
	* Add switch for Crating Services
	* Add combobox for Crate
	* Add Text for Cubic Meter
	* Truck Type visibility
	* Pickup and Delivery details move to header
	* Truck type and Courier move to header

* 1.2.4
	* Set Email char limit from 100 to 60
	
* 1.2.3
	* Set Activity field as non-mandatory
	* Increase maximum no of attachments per DTD from 4 to 10
	* Increase upload file size from 3MB to 30MB per DTD attachment
	* Increase upload file size from 5MB to 10MB for Bulk Request
	* Replace Mode of Payment "Charge-To-Bill" to "Others"
	* Allow zip file format for attachments

* 1.2.2
	* Set Email char limit from 30 to 100

* 1.2.1
	* Change search help text from "Select province" to "Select Cost center"

* 1.2.0
	* Make RO and STO numeric field.
	* Add Reservation no. and STO in view mode of DTD request.
	* Fix populate of address in pick-up and delivery details  
	* Add STO and RO field in single trade create and edit scenario.

* 1.1.0
	* Add ‘None’ text if field is empty in view mode of subscriber details.
	* VE210015 Fixed date formatting from YYYY to yyyy.

* 1.0.0
	* New application for DTD Non-trade request.

## License
Distributed under Globe license. See ``LICENCE`` for more information.

## Development
1. Clone from [SAP Web IDE](https://git.ap1.hana.ondemand.com/zz1qtpwp2i/zssdolman).
2. Create your feature branch (`git checkout -b dev`).
3. Commit your changes (`git commit -am '<Username> Added some fooBar'`).
4. Push to the branch (`git push origin dev`).