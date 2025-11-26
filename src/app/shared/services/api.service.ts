import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

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