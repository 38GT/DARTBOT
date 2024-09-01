export const ApiErrorCode = {
  '000': 'SUCCESS',
  '010': 'REGISTRATION_KEY_NOT_FOUND',
  '011': 'KEY_NOT_AVAILABLE',
  '012': 'IP_NOT_ALLOWED',
  '013': 'DATA_NOT_FOUND',
  '014': 'FILE_NOT_FOUND',
  '020': 'REQUEST_LIMIT_EXCEEDED',
  '021': 'COMPANY_COUNT_EXCEEDED',
  '100': 'INVALID_FIELD_VALUE',
  '101': 'INVALID_ACCESS',
  '800': 'SYSTEM_UNDER_MAINTENANCE',
  '900': 'UNDEFINED_ERROR',
  '901': 'ACCOUNT_EXPIRED',
  '999': 'NETWORK_ERROR',
} as const;

export const ApiErrorMessages = {
  '000': '정상 응답',
  '010': '등록되지 않은 키입니다.',
  '011':
    '사용할 수 없는 키입니다. 오픈API에 등록되었으나, 일시적으로 사용 중지된 키를 통하여 검색하는 경우 발생합니다.',
  '012': '접근할 수 없는 IP입니다.',
  '013': '조회된 데이타가 없습니다.',
  '014': '파일이 존재하지 않습니다.',
  '020': '요청 제한을 초과하였습니다.',
  '021': '조회 가능한 회사 개수가 초과하였습니다.(최대 100건)',
  '100':
    '필드의 부적절한 값입니다. 필드 설명에 없는 값을 사용한 경우에 발생하는 메시지입니다.',
  '101': '부적절한 접근입니다.',
  '800': '시스템 점검으로 인한 서비스가 중지 중입니다.',
  '900': '정의되지 않은 오류가 발생하였습니다.',
  '901':
    '사용자 계정의 개인정보 보유기간이 만료되어 사용할 수 없는 키입니다. 관리자 이메일(opendart@fss.or.kr)로 문의하시기 바랍니다.',
} as const;
