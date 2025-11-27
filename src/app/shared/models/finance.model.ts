export interface FinanceDoc {
    vendorId: string;      // VENDOR_ID
    invoiceNum: string;    // INVOICE_NUM
    postingDate: string;   // POSTING_DATE
    docDate: string;       // DOC_DATE
    amount: number;        // AMOUNT
    currency: string;      // CURRENCY
    dueDate: string;       // DUE_DATE
    agingDays: number;     // AGING_DAYS
    
    // Helper for UI styling
    status?: 'Current' | 'Overdue'; 
  }
  
  export interface MemoDoc {
    vendorId: string;      // VENDOR_ID
    memoNum: string;       // MEMO_NUM
    docType: string;       // DOC_TYPE (WE/RE)
    postingDate: string;   // POSTING_DATE
    amount: number;        // AMOUNT
    currency: string;      // CURRENCY
    debitCredInd: 'S' | 'H'; // S=Debit, H=Credit
    
    materialNo?: string;
    quantity?: number;
    unit?: string;
  }