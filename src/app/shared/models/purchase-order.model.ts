export interface PurchaseOrder {
    poNumber: string;     // PO_NUMBER
    vendorId: string;     // VENDOR_ID
    poDate: string;       // PO_DATE
    purchOrg: string;     // PURCH_ORG
    materialNo: string;   // MATERIAL_NO
    unit: string;         // UNIT
    netPrice: number;     // NET_PRICE
    deliveryDate: string; // DELIVERY_DATE
    currency: string;     // CURRENCY
    
    // Computed Frontend Fields
    status?: 'Open' | 'Urgent' | 'Delivered'; 
  }