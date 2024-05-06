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

// 데이터베이스 연결
// db.connect(err => {
//     if (err) {
//         throw err;
//     }
//     console.log('MySQL connected...');
// });

db.query = util.promisify(db.query);

export const getServices = async (user_id)=>{
  const query = `
  SELECT s.service_id, s.service_name
  FROM services s
  JOIN subscriptions sub ON s.service_id = sub.service_id
  WHERE sub.user_id = ?
`
  return db.query(query,[user_id])
}

export const getServicesAll = async () => {
  return db.query('SELECT * FROM services')
}
export const updateSubscriptions = async (chatId, selectedServices) => {
    try {
    //   const connection = await pool.getConnection();
  
      // 기존 구독 정보를 삭제
      await db.query('DELETE FROM subscriptions WHERE user_id = ?', [chatId]);
  
      // 새 구독 정보를 추가
      if (selectedServices.size > 0) {
        const values = Array.from(selectedServices).map(serviceId => [chatId, serviceId]);
        await db.query('INSERT INTO subscriptions (user_id, service_id) VALUES ?', [values]);
      }
  
    //   connection.release();
      console.log('Subscriptions updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update subscriptions:', error);
      return false;
    }
  }

export const getSubscribers2 = async (service_name) => {
  const query = `
  SELECT DISTINCT user_id
  FROM subscriptions
  WHERE service_name = '${service_name}';
  `;
  try{
    const result = await db.query(query)
    return result;
  }catch(err){
    console.log(err)
  }

}

export const getSubscribers = async (service_name) => {
  const query = `
    SELECT DISTINCT user_id
    FROM subscriptions
    JOIN services ON subscriptions.service_id = services.service_id
    WHERE services.service_name = ?;
  `;
  try {
    const result = await db.query(query, [service_name]); // service_name을 안전하게 쿼리에 바인딩
    return result;
  } catch (err) {
    console.error('Error querying database:', err);
    return null; // 에러 발생 시 null 반환 또는 적절한 에러 처리
  }
}

  
// export const updateServices = async ()=> {

// }