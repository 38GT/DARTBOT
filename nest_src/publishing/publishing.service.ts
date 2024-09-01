import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { DisclosureDto } from 'src/dto/disclosure.dto';
import { DisclosureState } from 'src/enum/disclosure-state.enum';
import { StateManagerService } from 'src/state-manager/state-manager.service';

@Injectable()
export class PublishingService extends EventEmitter implements OnModuleInit {
  constructor(private stateManagerService: StateManagerService) {
    super();
  }
  onModuleInit() {}
  public processData(data: DisclosureDto) {
    const report = `기업: ${data.corp_name} 
            보고서: ${data.report_nm}
            링크: https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${data.rcept_no}`;
    data.report = report;
    this.stateManagerService.setDisclosureState(
      data.rcept_no,
      DisclosureState.PUBLISHING_SUCCESS,
    );
    console.log(
      `PROCESSING: [${DisclosureState.PUBLISHING_SUCCESS}], rcept_no: ${data.rcept_no}`,
    );
    this.emit('processingComplete', data);
  }
}
