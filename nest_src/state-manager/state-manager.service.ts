import { Injectable, OnModuleInit } from '@nestjs/common';
import { DisclosureState } from 'src/enum/disclosure-state.enum';

@Injectable()
export class StateManagerService implements OnModuleInit {
  private disclosureStates: Map<string, DisclosureState> = new Map();
  constructor() {}
  async onModuleInit() {}

  public getDisclosureState(rcept_no: string): string {
    return this.disclosureStates.get(rcept_no);
  }

  public getAllDisclosureStates(): [string, string][] {
    return Array.from(this.disclosureStates.entries());
  }

  public setDisclosureState(rcept_no: string, state): void {
    this.disclosureStates.set(rcept_no, state);
  }

  //그레이스풀 셧다운과 부트스트래핑할때에 사용할 메서드들
  public async loadState(): Promise<void> {}
  public async saveState(): Promise<void> {}
}
