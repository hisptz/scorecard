import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class HttpClientService {
  constructor(private http: HttpClient) {
  }

  createAuthorizationHeader(headers: HttpHeaders, options?) {
    if (options) {
      for (const key in options) {
        if (key) {
          headers.append(key, options[key]);
        }
      }
    }
  }

  get(url) {
    return this.http.get(url);
  }

  post(url, data, options?) {
    return this.http.post(url, data);
  }

  put(url, data, options?) {
    return this.http.put(url, data);
  }

  delete(url, options?) {
    return this.http.delete(url);
  }

}
