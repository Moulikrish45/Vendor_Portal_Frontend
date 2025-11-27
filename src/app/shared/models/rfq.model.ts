export interface RFQ {
    vendorId: string;      // VENDOR_ID
    rfqNumber: string;     // RFQ_NUMBER
    rfqDate: string;       // RFQ_DATE
    materialText: string;  // MATERIAL_TEXT
    quantity: number;      // QUANTITY
    unit: string;          // UNIT
    daysOpen?: number;
  }