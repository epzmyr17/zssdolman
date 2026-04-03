# Changelog
All notable changes to this project will be documented in this file.

## 3.0.0 (2023-12-04)
### Change History
- Transport No	: FD2K900175
- Ticket/CR ID	: PAL-2023-010
- Functional	: Michael John Tan
- Developer		: Jeff Matan (MS223343)
- Date			: 2023-12-04
- Description	:
	- Handling of data relation for Mode of transport and Delivery type
	- New UI field to be shown specifically for Traded only, Store (Name)
	- New UI field to be shown specifically for Traded and Non-Traded only, Sloc (Issuing, Receiving)

## 2.0.0 (2023-10-17)
### Change History
- Transport No	: FD2K900109
- Ticket/CR ID	: PAL-2023-004 / 007
- Functional	: Michael John Tan
- Developer		: Jeff Matan (MS223343)
- Date			: 2023-10-17
- Description	:
	- New UI field to be shown specifically for Non-Trade only, Volumetric Weight
	- New UI field to be shown specifically for Non-Trade only, Chargeable Weight
	- Replace RORO Mode of Delivery to RORO – Normal & and add RORO – Truckload

## 1.2.8 (2023-08-02)
### Change History
- Transport No	: FD2K900109
- Ticket/CR ID	: PAL-2023-003
- Functional	: Michael John Tan
- Developer		: Jeff Matan (MS223343)
- Date			: 2023-08-02
- Description	:
	- Rearrange Cost center and Company
	- Cost center requires Company
	- Filter Cost center by Bukrs and Kostl
	- Change Cost center service
	- Display Cost center node
	- New field IO charging account
	- Clear courier if does not exist in serviceable

## 1.2.7 (2023-07-27)
### Change History
- Transport No	: FD2K900107
- Ticket/CR ID	: PAL-2023-002
- Functional	: Michael John Tan
- Developer		: Paul Baylas (MS232937)
- Date			: 2023-07-27
- Description	:
	- Adjust logic for oda passing oda value to function import

## 1.2.6 (2023-07-12)
### Change History
- Transport No	: FD2K900101
- Ticket/CR ID	: PAL-2023-002
- Functional	: Michael John Tan
- Developer		: Jeff Matan (MS223343)
- Date			: 2023-07-12
- Description	:
	- Adjust RORO weight limit to 5000

## 1.2.5 (2023-02-10)
### Change History
- Transport No	: FD2K900067
- Ticket/CR ID	: PAL-2023-002
- Functional	: Michael John Tan
- Developer		: Jeff Matan (MS223343)
- Date			: 2023-02-10
- Description	:
	- Add switch for Manpower Services
	- Add combobox for Manpower
	- Add switch for Crating Services
	- Add combobox for Crate
	- Add Text for Cubic Meter
	- Truck Type visibility
	- Pickup and Delivery details move to header
	- Truck type and Courier move to header

## 1.2.4 (2022-06-03)
### Change History
- Transport No	: FIDK901124
- Ticket/CR ID	: Project OneLook
- Functional	: James Santiago
- Developer		: Jeff Matan (MS223343)
- Date			: 2022-06-03
- Description	:
	- Decrease Email Address character limit from 100 to 60

## 1.2.3 (2022-04-13)
### Change History
- Transport No	: FIDK901098, FIDK901106, FIDK901112
- Ticket/CR ID	: Project OneLook
- Functional	: Michael John Tan
- Developer		: Paul Baylas (MS212205)
- Date			: 2022-04-13
- Description	:
	- Set Activity field as non-mandatory
	- Increase maximum no of attachments per DTD from 4 to 10
	- Increase upload file size from 3MB to 30MB per DTD attachment
	- Increase upload file size from 5MB to 10MB for Bulk Request
	- Replace Mode of Payment "Charge-to-Bill" to "Others"
	- Allow zip file format for attachments

## 1.2.2 (2022-03-02)
### Change History
- Transport No	: FIDK901060
- Ticket/CR ID	: CHG0043700
- Functional	: James Santiago
- Developer		: Paul Baylas (MS212205)
- Date			: 2022-03-02
- Description	:
	- Increase Email Address character limit from 30 to 100

## 1.2.1 (2022-02-22)
### Change History
- Transport No	: FIDK901052
- Ticket/CR ID	: CHG0042364
- Functional	: James Santiago
- Developer		: Baltazar (VE210015)
- Date			: 2022-02-22
- Description	:
	- Change search help text from "Select province" to "Select Cost center"

## 1.2.0 (2022-02-14)
### Change History
- Transport No	: FIDK901045
- Ticket/CR ID	: CHG0041912
- Functional	: James Santiago
- Developer		: Mhia Cruz (MS210335) / Baltazar (VE210015) / Baylas (MS212205)
- Date			: 2022-02-14
- Description	:
	- Make RO and STO numeric field.
	- Add Reservation no. and STO in view mode of DTD request.
	- Fix populate of address in pick-up and delivery details  
	- Add STO and RO field in single trade create and edit scenario.

## 1.1.0 (2022-01-27)
### Change History
- Transport No	: FIDK901029
- Ticket/CR ID	: Project Onelook
- Functional	: James Santiago
- Developer		: Mhia Cruz (MS210335) / Baltazar (VE210015) / Baylas (MS212205)
- Date			: 2022-01-27
- Description	:
	- Add ‘None’ text if field is empty in view mode of subscriber details.
	- VE210015 Fixed date formatting from YYYY to yyyy.

## 1.0.0 (2021-12-09)
### Change History
- Transport No	: FIDK900891
- Ticket/CR ID	: Project Onelook
- Functional	: James Santiago
- Developer		: Mhia Cruz (MS210335) / Baltazar (VE210015)
- Date			: 2021-12-09
- Description	:
	- New application for DTD Non-trade request.