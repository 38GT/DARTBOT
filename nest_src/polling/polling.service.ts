import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { StateManagerService } from '../state-manager/state-manager.service';
import { DisclosureDto } from 'src/dto/disclosure.dto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { debug } from 'src/utils/debug';
import { ApiErrorCode, ApiErrorMessages } from 'src/enum/dart-api-error-codes';
import { DisclosureState } from 'src/enum/disclosure-state.enum';

type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

interface FetchTotalCountResponse {
  totalCount?: number;
  status: ApiErrorCodeType;
}
interface fetchCurrentListResponse {
  newDisclosureList: DisclosureDto[];
  status: ApiErrorCodeType;
}

@Injectable()
export class PollingService extends EventEmitter implements OnModuleInit {
  private API_KEY: string;

  constructor(
    private configService: ConfigService,
    private stateManagerService: StateManagerService,
  ) {
    super();
    this.API_KEY = this.configService.get<string>('API_KEY2');
  }

  onModuleInit() {
    this.startPolling(6000);
  }

  private readonly BASE_URL = 'https://opendart.fss.or.kr/api/list.json';

  private startPolling(ms) {
    const handleApiResponse = async (response) => {
      const { status } = response;
      const keyChangeCases = ['011', '012', '020', '901'];

      if (status !== ApiErrorCode['000']) {
        if (keyChangeCases.includes(status)) {
          this.updateApiKey();
          console.log(`KEY_CHANGE OCCUR! TO ${this.API_KEY}`);
        }
        return false;
      }
      return true;
    };

    setInterval(async () => {
      const totalCountResponse = await this.fetchTotalCount();
      if (!(await handleApiResponse(totalCountResponse))) return;

      const { totalCount } = totalCountResponse;
      if (
        this.stateManagerService.getAllDisclosureStates().length !== totalCount
      ) {
        const currentListResponse = await this.fetchCurrentList(totalCount);
        if (!(await handleApiResponse(currentListResponse))) return;

        this.emit('processingComplete', currentListResponse.newDisclosureList);
      }
    }, ms);
  }

  private async fetchTotalCount(): Promise<FetchTotalCountResponse> {
    let totalCount: number;
    let status: ApiErrorCodeType;
    try {
      const response = await axios.get(
        `${this.BASE_URL}?crtfc_key=${this.API_KEY}`,
      );
      totalCount = parseInt(response.data.total_count);
      status = response.data.status;
    } catch (err) {
      console.error(err);
      status = ApiErrorCode['999'];
    } finally {
      return { totalCount, status };
    }
  }

  private async fetchCurrentList(
    totalCount: number,
  ): Promise<fetchCurrentListResponse> {
    let status: ApiErrorCodeType;
    let newDisclosureList: DisclosureDto[] = [];
    const page_num = Math.floor(totalCount / 100) + 1;
    try {
      for (let i = 1; i <= page_num; i++) {
        const response = await axios.get(
          `https://opendart.fss.or.kr/api/list.json?crtfc_key=${this.API_KEY}&page_count=100&page_no=${i}`,
        );
        status = response.data.status;
        if (status !== ApiErrorCode['000']) return;

        for (let disclosure of response.data.list) {
          const status = this.stateManagerService.getDisclosureState(
            disclosure.rcept_no,
          );
          const isFailed = (status) => /_FAILED/.test(status);
          if (!status) newDisclosureList.push(disclosure);
          if (isFailed(status)) newDisclosureList.push(disclosure);
          this.stateManagerService.setDisclosureState(
            disclosure.rcept_no,
            DisclosureState.POLLING_SUCCESS,
          );
        }
      }
    } catch (err) {
      console.error(err);
      status = ApiErrorCode['999'];
    } finally {
      return { newDisclosureList, status };
    }
  }
  private updateApiKey(): void {
    this.API_KEY =
      this.API_KEY === this.configService.get<string>('API_KEY3')
        ? this.configService.get<string>('API_KEY2')
        : this.configService.get<string>('API_KEY3');
    console.log(`API 키가 변경되었습니다: ${this.API_KEY}`);
  }
}
