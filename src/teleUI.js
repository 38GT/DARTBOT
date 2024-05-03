import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const TELE_TOKEN = process.env.TELE_TOKEN_TEST;
const bot = new TelegramBot(TELE_TOKEN, { polling: true });

const rooms = new Map();

/* 

UI/UX

1. /bot 명령어 입력 시 기존 컨트롤러 메세지 삭제 후 새로운 메세지 가져옴 (V)
2. 구독 갱신은 일괄 처리로 변경 -> 우선 서비스 3개 먼저 만들어야 한다. -> 
3. 컨트롤러 UI 

|서비스 1|서비스 2|서비스 3|
|         확인         |

*/

let controller_id = ''

bot.on('message', (msg) => {
  if (msg.text === '/bot') {
    const chatId = msg.chat.id;
    const room_title = msg.chat.title || (msg.chat.first_name + msg.chat.username); // 그룹 채팅이 아닌 경우를 대비해 기본값 설정
    console.log(msg)

    // 채팅방 정보가 없으면 초기화
    if (!rooms.has(chatId)) {
        rooms.set(chatId, {
            room_title,
            subscriptions: [] // 구독중인 서비스 목록
        });
    }

    
    // 해당 채팅방의 현재 구독 정보를 가져옴
    const roomInfo = rooms.get(chatId);
    const button = { text: 'test', callback_data: 'noop'}
    const options = {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '서비스 1', callback_data: 'service1' },{ text: '서비스 2', callback_data: 'service2' },{ text: '서비스 3', callback_data: 'service3' }],
          [{ text: '확인', callback_data: 'enter' }]
      ]
      })
    };
    bot.sendMessage(chatId, "<b>서비스 구독 관리</b>", options).then(
      msg => {
        console.log('controller msg: ',msg)
        if(controller_id !== '') bot.deleteMessage(chatId,controller_id)
        controller_id = msg.message_id
      }
    )
    console.log(msg)
    // showAvailableServices(chatId, msg.message_id, roomInfo.subscriptions);
  }
});

// bot.on('callback_query', (callbackQuery) => {
//   const data = callbackQuery.data;

//   // 더미 데이터 "noop"를 무시하고 실제 작업 수행
//   if (data === 'noop') {
//       console.log('No operation for this button.');
//   } else {
//       // 다른 callback_data에 대한 처리
//       console.log(`Received callback data: ${data}`);
//   }
// });

// bot.on('callback_query', (callbackQuery) => {
//   const message = callbackQuery.message;
//   const chatId = message.chat.id;
//   const messageId = message.message_id;
//   const userId = callbackQuery.from.id;
//   const data = callbackQuery.data;

//   const roomInfo = rooms.get(chatId);
//   const subscriptions = roomInfo.subscriptions;

//   try {
//       if (data.startsWith('toggle_temp_')) {
//           toggleServiceSelection(chatId, messageId, userId, data.split('_')[2], subscriptions);
//           // 상태 업데이트 후 메시지를 수정하지 않고 임시 상태로 유지
//       } else if (data === 'apply_changes') {
//           bot.sendMessage(chatId, `변경된 구독 서비스: ${subscriptions.join(', ')}`).catch(error => {
//               console.error('Failed to apply changes:', error);
//               bot.sendMessage(chatId, '서비스 변경에 실패했습니다. 다시 시도해주세요.').catch(console.error);
//           });
//       } else if (data === 'cancel_changes') {
//           subscriptions.splice(0, subscriptions.length); // 모든 선택 취소
//           bot.sendMessage(chatId, '변경이 취소되었습니다.').catch(console.error);
//       }
//   } catch (error) {
//       console.error('Error handling callback query:', error);
//       bot.sendMessage(chatId, '처리 중 오류가 발생했습니다.').catch(console.error);
//   }
// });


function showAvailableServices(chatId, messageId, subscriptions) {
  const services = ['서비스1', '서비스2', '서비스3'];
  const buttons = services.map(service => {
      const isSelected = subscriptions.includes(service);
      return [{ text: isSelected ? `✅ ${service}` : service, callback_data: `toggle_subscribe_${service}` }];
  });

  buttons.push([
    { text: '변경 적용', callback_data: 'apply_changes' },
    { text: '취소', callback_data: 'cancel_changes' }
  ]); 

    const options = {
        reply_markup: JSON.stringify({ inline_keyboard: buttons })
    };

    bot
    .deleteMessage(chatId, messageId)
    .then(() => {
      // 메시지 삭제 후 새로운 메시지를 보냅니다.
      bot.sendMessage(
        chatId,
        "구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):",
        options
      );
    })
    .catch((error) => {
      console.error("Failed to delete or send new message:", error);
      // 만약 메시지 삭제에 실패하면, 새 메시지를 보내려는 시도를 할 수 있습니다.
      bot.sendMessage(
        chatId,
        "구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):",
        options
      );
    });
  //   if (messageId) {
  //     // 기존 메시지 수정
  //     bot.editMessageText('구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):', {
  //       a: 1,
  //       b: 2
  //         // chat_id: chatId,
  //         // message_id: messageId,
  //         // reply_markup: options.reply_markup
  //     }).catch(error => {
  //         console.error('Failed to edit messag, 기존 메세지 수정 오류');
  //     });
  // } else {
  //     // 처음 메시지 보내기
  //     bot.sendMessage(chatId, '구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):', options).catch(error => {
  //         console.error('Failed to send message, 처음 메세지 보내기 오류');
  //     });
  // }
}






// function showAvailableServices(chatId, messageId, subscriptions) {
//   const services = ["서비스1", "서비스2", "서비스3"];
//   const buttons = services.map((service) => {
//     const isSelected = subscriptions.includes(service);
//     return [
//       {
//         text: isSelected ? `✅ ${service}` : `${service}`,
//         callback_data: `toggle_subscribe_${service}`,
//       },
//     ];
//   });

//   const options = {
//     reply_markup: JSON.stringify({ inline_keyboard: buttons }),
//   };

//   // 먼저 메시지를 삭제합니다.
//   bot
//     .deleteMessage(chatId, messageId)
//     .then(() => {
//       // 메시지 삭제 후 새로운 메시지를 보냅니다.
//       bot.sendMessage(
//         chatId,
//         "구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):",
//         options
//       );
//     })
//     .catch((error) => {
//       console.error("Failed to delete or send new message:", error);
//       // 만약 메시지 삭제에 실패하면, 새 메시지를 보내려는 시도를 할 수 있습니다.
//       bot.sendMessage(
//         chatId,
//         "구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):",
//         options
//       );
//     });
// }


// function showAvailableServices(chatId, messageId, userId, subscriptions) {
//   const services = ["서비스1", "서비스2", "서비스3"];
//   const buttons = services.map((service) => {
//     const isSelected = subscriptions.includes(service);
//     return [
//       {
//         text: isSelected ? ✅ ${service} : ${service},
//         callback_data: toggle_subscribe_${service},
//       },
//     ];
//   });

//   const options = {
//     reply_markup: JSON.stringify({ inline_keyboard: buttons }),
//   };

//   // 먼저 메시지를 삭제합니다.
//   bot
//     .deleteMessage(chatId, messageId)
//     .then(() => {
//       // 메시지 삭제 후 새로운 메시지를 보냅니다.
//       bot.sendMessage(
//         chatId,
//         "구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):",
//         options
//       );
//     })
//     .catch((error) => {
//       console.error("Failed to delete or send new message:", error);
//       // 만약 메시지 삭제에 실패하면, 새 메시지를 보내려는 시도를 할 수 있습니다.
//       bot.sendMessage(
//         chatId,
//         "구독하고 싶은 서비스를 선택하세요 (다중 선택 가능):",
//         options
//       );
//     });
// }