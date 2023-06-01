import {Injectable} from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
/**
 * A service for generating QR codes from input strings.
 * @class
 * @injectable
 */
export class QrCodeService {
  /**
   * Generates a QR code image from the input string.
   * @param {string} input The input string to generate the QR code from.
   * @returns {Promise<string>} A Promise that resolves with the base64-encoded data URL of the generated QR code image.
   */
  generateQrCode(input: string): Promise<string> {
    return QRCode.toDataURL(input);
  }
}
