import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constants } from './costants';

@Injectable()
export class HttpClientService {
  public APIURL = '../../../api/';
  constructor(private http: HttpClient) {}

  createAuthorizationHeader(headers: HttpHeaders, options?) {
    if (options) {
      options.forEach((key, values) => {
        headers.append(key, options[key]);
      });
    }
  }

  get(url) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers);
    return this.http.get<any>(this.APIURL + url, {
      headers: headers
    });
  }

  get_from_base(url) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers);
    return this.http.get<any>(url, {
      headers: headers
    });
  }

  post(url, data, options?) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers, options);
    return this.http.post<any>(this.APIURL + url, data, {
      headers: headers
    });
  }
  put(url, data, options?) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers, options);
    return this.http.put<any>(this.APIURL + url, data, {
      headers: headers
    });
  }

  delete(url, options?) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers, options);
    return this.http.delete(this.APIURL + url, {
      headers: headers
    });
  }
}
