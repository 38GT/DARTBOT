export class HealthDto {
  last_update_time: string;
  api_res_count: number;
  memory_usage: string;
  uptime: string; // 애플리케이션 가동 시간 (예: "2h 30m")
  cpu_usage: string; // CPU 사용량 (예: "30%")
  disk_usage: string; // 디스크 사용량 (예: "70GB/100GB")
}
