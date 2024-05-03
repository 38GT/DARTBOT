const now = () => {
  const now = new Date(); // 현재 시간을 가져옵니다.

  // 각 항목을 두 자리 숫자로 포맷하는 함수
  const pad = (num) => num.toString().padStart(2, '0');

  // 날짜 및 시간 구성 요소를 추출합니다.
  const year = now.getFullYear();  // 년도
  const month = pad(now.getMonth() + 1);  // 월 (0부터 시작하므로 1을 더합니다)
  const day = pad(now.getDate());  // 일
  const hour = pad(now.getHours());  // 시
  const minute = pad(now.getMinutes());  // 분
  const second = pad(now.getSeconds());  // 초

  // 형식에 맞게 문자열로 결합합니다.
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export default now;