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
}