import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IpService {

  constructor(private http: HttpClient) { }

  getPublicIp() {
    return this.http.get('https://api.ipify.org/?format=json');
  }
}
