import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VendorProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getVendorProfile(vendorId: string): Observable<VendorProfile> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_PROFILE_863>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_PROFILE_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const url = '/sap/bc/srt/scs/sap/ZRFC_PROFILE_VENDOR_863?sap-client=' + environment.sapClient;

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({ 'Content-Type': 'text/xml; charset=utf-8' }),
      responseType: 'text'
    }).pipe(map(xml => this.parseProfileXml(xml)));
  }

  private parseProfileXml(xml: string): VendorProfile {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    // The XML structure returns a list, but we just need the first item for the profile
    const item = xmlDoc.getElementsByTagName('item')[0];

    if (!item) {
      throw new Error('Profile not found');
    }

    const getText = (tag: string) => item.getElementsByTagName(tag)[0]?.textContent || '';

    return {
      vendorId: getText('VENDOR_ID'),
      name: getText('VENDOR_NAME'),
      city: getText('CITY'),
      country: getText('COUNTRY'),
      status: getText('STATUS_MSG')
    };
  }

  // 1. Fetch Finance (Invoices & Aging)
  getFinanceData(vendorId: string): Observable<any[]> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_FINANCE_863>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_FINANCE_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    // Update URL
    const url = '/sap/bc/srt/scs/sap/ZRFC_FINANCE_Vendor_863?sap-client=' + environment.sapClient;

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({ 'Content-Type': 'text/xml; charset=utf-8' }),
      responseType: 'text'
    }).pipe(map(xml => this.parseFinanceXml(xml)));
  }

  // 2. Fetch Memos
  getMemoData(vendorId: string): Observable<any[]> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_MEMO_863>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_MEMO_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
    // Update URL
    const url = '/sap/bc/srt/scs/sap/ZRFC_Memo_Vendor_863?sap-client=' + environment.sapClient;

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({ 'Content-Type': 'text/xml; charset=utf-8' }),
      responseType: 'text'
    }).pipe(map(xml => this.parseMemoXml(xml)));
  }

  // --- PARSERS ---

  private parseFinanceXml(xml: string): any[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const items = xmlDoc.getElementsByTagName('item');
    const list: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const getText = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || '';

      list.push({
        invoiceNum: getText('INVOICE_NUM'),
        postingDate: getText('POSTING_DATE'),
        docDate: getText('DOC_DATE'),
        amount: parseFloat(getText('AMOUNT') || '0'),
        currency: getText('CURRENCY'),
        dueDate: getText('DUE_DATE'),
        agingDays: parseInt(getText('AGING_DAYS') || '0', 10)
      });
    }
    return list;
  }

  private parseMemoXml(xml: string): any[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const items = xmlDoc.getElementsByTagName('item');
    const list: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const getText = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || '';

      list.push({
        memoNum: getText('MEMO_NUM'),
        docType: getText('DOC_TYPE'),
        postingDate: getText('POSTING_DATE'),
        amount: parseFloat(getText('AMOUNT') || '0'),
        currency: getText('CURRENCY'),
        debitCredInd: getText('DEBIT_CRED_IND'), // 'S' or 'H'
        materialNo: getText('MATERIAL_NO'),
        quantity: parseFloat(getText('QUANTITY') || '0'),
        unit: getText('UNIT')
      });
    }
    return list;
  }

  getGoodsReceipts(vendorId: string): Observable<any[]> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_GR_863>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_GR_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const url = '/sap/bc/srt/scs/sap/ZRFC_GR_Vendor_863?sap-client=' + environment.sapClient;

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml; charset=utf-8'
      }),
      responseType: 'text'
    }).pipe(
      map(responseXml => this.parseGrResponse(responseXml))
    );
  }

  private parseGrResponse(xml: string): any[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const items = xmlDoc.getElementsByTagName('item');
    const grList: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const getText = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || '';

      grList.push({
        matDocNum: getText('MAT_DOC_NUM'),
        fiscalYear: getText('FISCAL_YEAR'),
        compCode: getText('COMP_CODE'),
        vendorId: getText('VENDOR_ID'),
        // Format Material: Remove leading zeros
        materialNo: getText('MATERIAL_NO').replace(/^0+/, ''),
        plant: getText('PLANT'),
        postingDate: getText('POSTING_DATE')
      });
    }
    return grList;
  }

  getRFQs(vendorId: string): Observable<any[]> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_RFQ_863>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_RFQ_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    // Note: Update the URL to match the RFQ endpoint from your screenshot
    const url = '/sap/bc/srt/scs/sap/ZRFC_RFQ_Vendor_863?sap-client=' + environment.sapClient;

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml; charset=utf-8'
      }),
      responseType: 'text'
    }).pipe(
      map(responseXml => this.parseRfqResponse(responseXml))
    );
  }

  private parseRfqResponse(xml: string): any[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const items = xmlDoc.getElementsByTagName('item');
    const rfqList: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const getText = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || '';

      rfqList.push({
        vendorId: getText('VENDOR_ID'),
        rfqNumber: getText('RFQ_NUMBER'),
        rfqDate: getText('RFQ_DATE'),
        materialText: getText('MATERIAL_TEXT'),
        quantity: parseFloat(getText('QUANTITY') || '0'),
        unit: getText('UNIT')
      });
    }
    return rfqList;
  }

  getPurchaseOrders(vendorId: string): Observable<any[]> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_PO_863>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_PO_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const url = '/sap/bc/srt/scs/sap/ZRFC_PO_Vendor_863?sap-client=' + environment.sapClient;

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml; charset=utf-8'
        // Add SOAPAction if your server requires it, otherwise leave blank
      }),
      responseType: 'text'
    }).pipe(
      map(responseXml => this.parsePoResponse(responseXml))
    );
  }

  // Helper: Parse the List of POs
  private parsePoResponse(xml: string): any[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const items = xmlDoc.getElementsByTagName('item');
    const poList: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const node = items[i];

      // Helper to safely get text content
      const getText = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || '';

      poList.push({
        poNumber: getText('PO_NUMBER'),
        vendorId: getText('VENDOR_ID'),
        poDate: getText('PO_DATE'),
        purchOrg: getText('PURCH_ORG'),
        // Logic to remove leading zeros from Material Number
        materialNo: getText('MATERIAL_NO').replace(/^0+/, ''),
        unit: getText('UNIT'),
        netPrice: parseFloat(getText('NET_PRICE') || '0'),
        deliveryDate: getText('DELIVERY_DATE'),
        currency: getText('CURRENCY')
      });
    }
    return poList;
  }

  login(vendorId: string, password: string): Observable<any> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_LOGIN_863>
            <IV_PASSWORD>${password}</IV_PASSWORD>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_LOGIN_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const headers = new HttpHeaders({
      'SOAPAction': 'urn:sap-com:document:sap:rfc:functions:ZRFC_LOGIN_VALIDATE_863:ZFM_LOGIN_VALIDATE_RP_863Request'
      // Note: I used the Action from your screenshot. If it fails, try just empty string ""
    });

    // 3. Send POST and parse XML response
    return this.http.post(environment.apiUrl + '?sap-client=' + environment.sapClient, soapBody, {
      headers: headers,
      responseType: 'text' // We expect XML text, not JSON
    }).pipe(
      map(responseXml => this.parseSoapResponse(responseXml))
    );
  }

  // Helper: Converts ugly XML to clean JSON
  private parseSoapResponse(xml: string): any {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    // Extract values based on your Backend Return Parameters
    // Looking for <X> or <SUCCESS> or <IV_SUCCESS> based on your backend code
    // Assuming backend returns a parameter named 'SUCCESS' or 'EV_SUCCESS'

    // We try to find the specific tag. Adjust 'EV_SUCCESS' if your FM exports something else.
    // Based on previous chats, it was 'SUCCESS' or 'MESSAGE'.
    const successNode = xmlDoc.getElementsByTagName('SUCCESS')[0] || xmlDoc.getElementsByTagName('IV_SUCCESS')[0];
    const messageNode = xmlDoc.getElementsByTagName('MESSAGE')[0] || xmlDoc.getElementsByTagName('IV_MESSAGE')[0];

    return {
      success: successNode ? successNode.textContent === 'X' : false,
      message: messageNode ? messageNode.textContent : 'No response message'
    };
  }

  // 3. Fetch Invoice PDF
  getInvoicePdf(invoiceNo: string, vendorId: string): Observable<string> {
    console.log('API: getInvoicePdf called', { invoiceNo, vendorId });
    
    // Pad invoice number with leading zeros to 10 digits (SAP standard)
    const paddedInvoiceNo = invoiceNo.padStart(10, '0');
    console.log('API: Padded invoice number:', paddedInvoiceNo);
    
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_INVOICE_PDF_863>
            <IV_INVOICE_NO>${paddedInvoiceNo}</IV_INVOICE_NO>
            <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
          </urn:ZFM_INVOICE_PDF_863>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const url = '/sap/bc/srt/scs/sap/ZRFC_INVOICE_PDF_VENDOR_863?sap-client=' + environment.sapClient;
    console.log('API: Requesting URL:', url);

    return this.http.post(url, soapBody, {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml; charset=utf-8'
      }),
      responseType: 'text'
    }).pipe(
      map(responseXml => {
        console.log('API: Response received (first 1000 chars):', responseXml.substring(0, 1000));
        return this.parsePdfResponse(responseXml);
      })
    );
  }

  private parsePdfResponse(xml: string): string {
    console.log('API: XML Response length:', xml.length);
    console.log('API: First 500 chars:', xml.substring(0, 500));
    console.log('API: Last 200 chars:', xml.substring(xml.length - 200));
    
    // Check if response contains empty tag <EV_BASE64/>
    if (xml.includes('<EV_BASE64/>')) {
      console.error('API: SAP returned empty EV_BASE64 tag - PDF not found in SAP');
      return '';
    }

    // Check for SAP error messages
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      console.error('API: XML Parser Error:', parserError[0].textContent);
      return '';
    }

    // Check for common SAP error tags
    const errorNode = xmlDoc.getElementsByTagName('ERROR')[0] || 
                      xmlDoc.getElementsByTagName('MESSAGE')[0] ||
                      xmlDoc.getElementsByTagName('EV_ERROR')[0];
    
    if (errorNode && errorNode.textContent) {
      console.error('API: SAP Error Message:', errorNode.textContent);
      return '';
    }

    // Try to find the Base64 tag
    const base64Node = xmlDoc.getElementsByTagName('EV_BASE64')[0] ||
      xmlDoc.getElementsByTagName('n0:EV_BASE64')[0] ||
      xmlDoc.getElementsByTagNameNS('*', 'EV_BASE64')[0];

    if (base64Node) {
      const base64Data = base64Node.textContent?.trim() || '';
      
      if (base64Data.length === 0) {
        console.error('API: EV_BASE64 tag found but empty');
        return '';
      }

      console.log('API: Found Base64 data');
      console.log('API: Tag name:', base64Node.tagName);
      console.log('API: Base64 length:', base64Data.length);
      console.log('API: First 50 chars:', base64Data.substring(0, 50));
      console.log('API: Last 50 chars:', base64Data.substring(base64Data.length - 50));
      
      // Validate it's proper Base64
      if (/^[A-Za-z0-9+/=\s]+$/.test(base64Data)) {
        return base64Data.replace(/\s/g, '');
      } else {
        console.error('API: Invalid Base64 format detected');
        return '';
      }
    }

    // Fallback to Regex
    console.log('API: Attempting Regex fallback');
    const pattern = /<EV_BASE64>([\s\S]+?)<\/EV_BASE64>/;
    const match = xml.match(pattern);
    
    if (match && match[1]) {
      const base64Data = match[1].trim().replace(/\s/g, '');
      console.log('API: Found Base64 via Regex, length:', base64Data.length);
      return base64Data;
    }

    console.error('API: EV_BASE64 tag not found or empty in SAP response');
    return '';
  }
}