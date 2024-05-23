import dotenv from "dotenv";
import { updateSubscriptions, getServices, getServicesAll } from '../data/DB.js'
import { bot } from '../bot/teleBot.js'
import { app } from '../app.js'
dotenv.config({ path: "../.env" });

export const subscriptionController = async () =>{
    app.set('allServices', await getServicesAll());
    const allServices = app.get('allServices')
    const userStates = new Map()

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const serviceButtons = [];

        //초기화
        if(!userStates.has(chatId)){
            const subscriptionInfo = await getServices(chatId);
            userStates.set(chatId, new Map([['subscriptionInfo',subscriptionInfo],['controller_id','']]))
        }

        allServices.forEach((serviceName, serviceId) => {
            const isSelected = userStates.get(chatId).get('subscriptionInfo').has(serviceId)
            serviceButtons.push([{ text: isSelected ? `✅ ${serviceName}` : `${serviceName}`, callback_data: `toggle_${serviceId}` }]);
        })

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
              const controller_id = userStates.get(chatId).get('controller_id')
              if(controller_id !== '') bot.deleteMessage(chatId, controller_id)
              userStates.get(chatId).set('controller_id',msg.message_id) 
            }
        );
    })
    
    bot.on('callback_query', async (callbackQuery) => {
        const message = callbackQuery.message;
        const chatId = message.chat.id;
        const data = callbackQuery.data;
        const subscriptionInfo = userStates.get(chatId).get('subscriptionInfo')
        if (data.startsWith('toggle_')) {
            const serviceId = data.split('_')[1];

            if (subscriptionInfo.has(serviceId)) {
                subscriptionInfo.delete(serviceId);
            } else {
                subscriptionInfo.set(serviceId,allServices.get(serviceId));
            }
            const serviceButtons = [];

            allServices.forEach((serviceName, serviceId) => {
                const isSelected = userStates.get(chatId).get('subscriptionInfo').has(serviceId)
                serviceButtons.push([{ text: isSelected ? `✅ ${serviceName}` : `${serviceName}`, callback_data: `toggle_${serviceId}` }]);
            })
            
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
            const subscriptionInfo = userStates.get(chatId).get('subscriptionInfo');
            const updateSuccess = await updateSubscriptions(chatId, subscriptionInfo);
            if (updateSuccess) {
              bot.sendMessage(chatId, "변경 사항이 저장되었습니다.");
            } else {
              bot.sendMessage(chatId, "서비스 변경에 실패했습니다. 다시 시도해주세요.");
            }
        } 
    });
}
