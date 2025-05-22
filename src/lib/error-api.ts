// lib/api.ts
import { message } from "antd";

export class ApiError extends Error {
  public readonly code: number;

  constructor(msg: string, code: number) {
    super(msg);
    this.name = 'ApiError';
    this.code = code;
    message.error(msg)
  }
}
