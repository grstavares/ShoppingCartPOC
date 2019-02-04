import { Logger, ServiceError } from '../common';

export class ConsoleLogger implements Logger {

  constructor(private readonly disabled: boolean) { }

  public log(message: string): void { if (!this.disabled) { console.log(message); } }

  public logError(message: string): void { if (!this.disabled) { console.log(message); } }

}
