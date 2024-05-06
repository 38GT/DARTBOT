import dotenv from "dotenv";
import { updateSubscriptions, getServices, getServicesAll } from '../data/DB.js'
import { bot } from '../bot/teleBot.js'
dotenv.config({ path: "../.env" });


export const subscriptionController = () =>{
    const rooms = new Map();
    let controller_id = ''
    
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
    
        if (!rooms.has(chatId)) {
            rooms.set(chatId, {
                subscriptions: await getServicesAll(chatId),
                selectedServices: new Set() 
            });
            console.log('chatId: ', chatId)
            const services = await getServices(chatId);
            console.log('services: ', services);
            rooms.get(chatId).selectedServices.add()
        }
    
        const serviceButtons = rooms.get(chatId).subscriptions.map(service => {
            const isSelected = rooms.get(chatId).selectedServices.has(service.service_id);
            return [{ text: isSelected ? `✅ ${service.service_name}` : `${service.service_name}`, callback_data: `toggle_${service.service_id}` }];
        });
    
        const options = {
            parse_mode: 'HTML',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    ...serviceButtons,
                    [{ text: '확인', callback_data: 'apply_changes' }],
                ]
            })
        };
    
        bot.sendMessage(chatId, "<b>서비스 구독 관리</b>", options).then(
          msg => {
            if(controller_id !== '') bot.deleteMessage(chatId, controller_id)
            controller_id = msg.message_id
          }
        );
    });
    
    bot.on('callback_query', async (callbackQuery) => {
        const message = callbackQuery.message;
        const chatId = message.chat.id;
        const data = callbackQuery.data;
        const roomInfo = rooms.get(chatId);
    
        if (data.startsWith('toggle_')) {
            const serviceId = data.split('_')[1];
            const selectedServices = roomInfo.selectedServices;
    
            if (selectedServices.has(serviceId)) {
                selectedServices.delete(serviceId);
            } else {
                selectedServices.add(serviceId);
            }
    
            const serviceButtons = roomInfo.subscriptions.map(service => {
                const isSelected = selectedServices.has(service.service_id);
                return [{ text: isSelected ? `✅ ${service.service_name}` : `${service.service_name}`, callback_data: `toggle_${service.service_id}` }];
            });
    
            const options = {
                parse_mode: 'HTML',
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        ...serviceButtons,
                        [{ text: '확인', callback_data: 'apply_changes' }],
                    ]
                })
            };
    
            bot.editMessageText("<b>서비스 구독 관리</b>", {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: 'HTML',
                reply_markup: options.reply_markup
            });
        } else if (data === 'apply_changes') {
            const updateSuccess = await updateSubscriptions(chatId, roomInfo.selectedServices);
            if (updateSuccess) {
              bot.sendMessage(chatId, "변경 사항이 저장되었습니다.");
            } else {
              bot.sendMessage(chatId, "서비스 변경에 실패했습니다. 다시 시도해주세요.");
            }
        } 
    });
}
