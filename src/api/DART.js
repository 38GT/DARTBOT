import axios from "axios";
import dotenv from "dotenv";
import now from '../utils/now.js'
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

    let updated_today_list;

    try {

      const response = await axios.get(`https://opendart.fss.or.kr/api/list.json?crtfc_key=${API_KEY}`);
      const data = response.data;
 
      if(response.data.status !== '000') {
        const result = [{id: null, corp: null, type: null,data: null, logs: ['[0]fetch_data: ' + DART.#status_log(response.data.status) + now()]}];
        console.log(result)
        return result
      }

      if(response.data.total_count === DART.today_list.length){
        const result = [{id: null, corp: null, type: null, data: null, logs: ['[0]fetch_data: ' + '공시 리스트 업데이트 없음' + now()]}]
        console.log(result);
        return result;
      }
      
      if((updated_today_list = await (DART.#get_today_list(data)))[0].data === null){
        const result = [{id: null, corp: null, type: null, data: null, logs: ['[0]fetch_data: ' + 'updated_today_list 불러오기 실패' + now()]}]
        console.log(result);
        return result;
      }

      const old_list = DART.today_list;
      DART.today_list = updated_today_list;
      DART.new_list = DART.today_list.filter(
        (item) => !old_list.some((disc) => DART.#is_same_disclosure(disc, item))
      );

      console.log('공시 리스트 업데이트 완료')
      return DART.new_list
      
    } catch (err) {
      console.error("fetch_data 에러 발생", err);
      console.log('test',updated_today_list)
    }
  }

  static async #get_today_list(data) {

    const updated_today_list = []

    const page_num = Math.floor(data.total_count/100)+1
    for( let i = 1; i <= page_num ; i ++){
      const response = await axios.get(`https://opendart.fss.or.kr/api/list.json?crtfc_key=${API_KEY}&page_count=100&page_no=${i}`)
      updated_today_list.push(...response.data.list.map(item => {
        const [ id, corp, type ] = [item.rcept_no, item.corp_name, item.report_nm.replace(/\[.*?\]|\([^)]*\)/g, '')]
        const result = {id: id, corp: corp, type: type, data: item, logs: ['[1]#get_today_list: ' + now()]}
        return result
      }
      ))
    }

    if(updated_today_list.length !== data.total_count){
      const result = {id: null, corp: null, type: null, data: null, logs: ['[1]#get_today_list: ' + 'length inconsistency problem' + now()]}
      console.log(result)
      return result;
    };    
    
    return updated_today_list;
  }

  static #is_same_disclosure(disc1, disc2) {
    return disc1.data.rcept_no === disc2.data.rcept_no;
  }

  static #status_log(status){
    let errorMessage;
    switch(status){
      case "010":
        errorMessage = '등록되지 않은 키입니다.';
        console.log(errorMessage)
        return errorMessage;
      case "011":
        errorMessage = '사용할 수 없는 키입니다. 오픈API에 등록되었으나, 일시적으로 사용 중지된 키를 통하여 검색하는 경우 발생합니다.'
        console.log(errorMessage)
        return errorMessage;
      case "012":
        errorMessage = '접근할 수 없는 IP입니다.'
        console.log(errorMessage)
        return errorMessage;
      case "013":
        errorMessage = '조회된 데이타가 없습니다'
        console.log(errorMessage)
        return errorMessage;
      case "014":
        errorMessage = '파일이 존재하지 않습니다.'
        console.log(errorMessage)
        return errorMessage;
      case "020":
        errorMessage = '요청 제한을 초과하였습니다.'
        console.log(errorMessage)
        return errorMessage;
      case "021":
        errorMessage = '조회 가능한 회사 개수가 초과하였습니다.(최대 100건)'
        console.log(errorMessage)
        return errorMessage;
      case "100":
        errorMessage = '필드의 부적절한 값입니다. 필드 설명에 없는 값을 사용한 경우에 발생하는 메시지입니다.'
        console.log(errorMessage)
        return errorMessage;
      case "101":
        errorMessage = '부적절한 접근입니다.'
        console.log(errorMessage)
        return errorMessage;
      case "800":
        errorMessage = '시스템 점검으로 인한 서비스가 중지 중입니다.'
        console.log(errorMessage)
        return errorMessage;
      case "900":
        errorMessage = '정의되지 않은 오류가 발생하였습니다.'
        console.log(errorMessage)
        return errorMessage;
      case "901":
        errorMessage = '사용자 계정의 개인정보 보유기간이 만료되어 사용할 수 없는 키입니다.관리자 이메일(opendart@fss.or.kr)로 문의하시기 바랍니다'
        console.log(errorMessage)
        return errorMessage;
    }
  }
}



