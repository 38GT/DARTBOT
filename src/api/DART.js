import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const API_KEY = process.env.API_KEY;

//notation 통일하기
export class DART {

  static #new_list = [];
  static #today_list = [];

  static get new_list() {
    return DART.#new_list;
  }

  static set new_list(new_list) {
    DART.#new_list = new_list;
  }

  static get today_list() {
    return DART.#today_list;
  }

  static set today_list(today_list) {
    DART.#today_list = today_list;
  }

  static async fetch_data() {
    try {
      const response = await axios.get(`https://opendart.fss.or.kr/api/list.json?crtfc_key=${API_KEY}&page_count=10`);

      if(response.data.status !== '000') {
        DART.#status_log(response.data.status)
        return;
      }

      console.log('fetch_data 정상 응답')

      if (response.data.total_count !== DART.today_list.length) {
        const old_list = DART.today_list;
        const data = response.data;
        DART.today_list = await DART.#get_today_list(data); // 올바른 값으로 업데이트가 되었다는 것이 확실하게 보장 되어야 한다. 실패 시 업데이트가 그냥 안되고 그 전 todat_list로 유지될 필요가 있다.
        DART.new_list = DART.today_list.filter(
          (item) => !old_list.some((disc) => DART.#is_same_disclosure(disc, item))
        );
      }
    } catch (err) {
      console.error("fetch_data 에러 발생", err);
    }
  }

  static async #get_today_list(data) {
    const pageRequests = [];


    const pageNum = data.total_page;

    // 아래 코드로 작동하는지 체크해봐야함
    // 요청 횟수 줄이기 
    for (let i = 1; i <= pageNum; i++) {
      const pageRequest = await axios.get(`https://opendart.fss.or.kr/api/list.json?crtfc_key=${API_KEY}&page_count=10&page_no=${i}`).data.list;
      pageRequests.push(...pageRequest);
    }
    
    const todayList = [...await Promise.all(pageRequests)];

    if (todayList.length !== data.total_count) throw new Error("#get_today_list length inconsistency problem");

    return todayList;
  }

  static #is_same_disclosure(disc1, disc2) {
    return disc1.corp_code === disc1.corp_code && disc1.report_nm === disc2.report_nm && disc1.rcept_no === disc2.rcept_no;
  }

  static #status_log(status){
    switch(status){
      case "010":
        console.log('등록되지 않은 키입니다.')
        break;
      case "011":
        console.log('사용할 수 없는 키입니다. 오픈API에 등록되었으나, 일시적으로 사용 중지된 키를 통하여 검색하는 경우 발생합니다.')
        break;
      case "012":
        console.log('접근할 수 없는 IP입니다.')
        break;
      case "013":
        console.log('조회된 데이타가 없습니다')
        break;
      case "014":
        console.log('파일이 존재하지 않습니다.')
        break;
      case "020":
        console.log('요청 제한을 초과하였습니다.')
        break;
      case "021":
        console.log('조회 가능한 회사 개수가 초과하였습니다.(최대 100건)')
        break;
      case "100":
        console.log('필드의 부적절한 값입니다. 필드 설명에 없는 값을 사용한 경우에 발생하는 메시지입니다.')
        break;
      case "101":
        console.log('부적절한 접근입니다.')
        break;
      case "800":
        console.log('시스템 점검으로 인한 서비스가 중지 중입니다.')
        break;
      case "900":
        console.log('정의되지 않은 오류가 발생하였습니다.')
        break;
      case "901":
        console.log('사용자 계정의 개인정보 보유기간이 만료되어 사용할 수 없는 키입니다.관리자 이메일(opendart@fss.or.kr)로 문의하시기 바랍니다')
        break;
    }
  }
}
