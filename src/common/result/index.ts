import { ResultCode } from '../enum/code';
import { EncryptDto } from 'src/user/user/dto';
import { AesCryptoHelper } from '../utils/cryptoUtils';

export class ResultData {
  code: number;
  data?: any;
  msg?: string;
  constructor(code: number = ResultCode.SUCCESS, data?: any, msg?: string) {
    this.code = code;
    this.data = data;
    this.msg = msg;
  }

  static ok(data?: any, msg?: string) {
    return new ResultData(ResultCode.SUCCESS, data, msg);
  }

  static fail(code: number, msg?: string, data?: any) {
    return new ResultData(code, data, msg);
  }

  static pageData(data: any[], total: number) {
    return new ResultData(ResultCode.SUCCESS, { data, total }, 'success');
  }
}
