const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더해줍니다.
const day = String(date.getDate()).padStart(2, "0");
export const today = `${year}-${month}-${day}`;

export default today;
