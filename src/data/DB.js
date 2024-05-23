import express from 'express';
import mysql from 'mysql';
import util from 'util';
const app = express();
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PWD,
  database:process.env.DB_DATABASE,
});

db.query = util.promisify(db.query);

export const getServices = async (user_id)=>{
  const query = `
  SELECT s.service_id, s.service_name
  FROM services s
  JOIN subscriptions sub ON s.service_id = sub.service_id
  WHERE sub.user_id = ?
  `
  const result = new Map() ;
  const data = await db.query(query,[user_id])
  data.forEach(item => {
    result.set(item.service_id,item.service_name)
  })

  return result;
}

export const getServicesAll = async () => {
  const result = new Map() ;
  const data = await db.query('SELECT * FROM services')
  data.forEach(item => {
    result.set(item.service_id,item.service_name)
  })
  return result;
}

export const updateSubscriptions = async (chatId, selectedServices) => {
    try {  
      // 기존 구독 정보를 삭제
      await db.query('DELETE FROM subscriptions WHERE user_id = ?', [chatId]);
  
      // 새 구독 정보를 추가
      if (selectedServices.size > 0) {
        const values = Array.from(selectedServices).map(([serviceId, serviceName]) => [chatId, serviceId]);        
        await db.query('INSERT INTO subscriptions (user_id, service_id) VALUES ?', [values]);
      }
      console.log('Subscriptions updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update subscriptions:', error);
      return false;
    }
}

export const getSubscribers = async (service_id) => {
  const query = `
    SELECT DISTINCT user_id
    FROM subscriptions
    JOIN services ON subscriptions.service_id = services.service_id
    WHERE services.service_id = ?;
  `;
  try {
    const result = await db.query(query, [service_id]); // service_name을 안전하게 쿼리에 바인딩
    return result;
  } catch (err) {
    console.error('Error querying database:', err);
    return null; // 에러 발생 시 null 반환 또는 적절한 에러 처리
  }
}

  
// export const updateServices = async ()=> {

// }