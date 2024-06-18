import { ResultCode } from '../enum/code';

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
}
