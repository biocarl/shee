import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {

  generateQrCode(input: string): Promise<string> {
    return QRCode.toDataURL(input);
  }
}
