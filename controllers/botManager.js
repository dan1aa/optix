const activeBots = {}; // Об'єкт для зберігання активних ботів

module.exports = {
    activeBots, // Експортуємо об'єкт
    stopBot: (sessionId) => {
        if (activeBots[sessionId]) {
            activeBots[sessionId] = false; // Зупиняємо бота
            console.log(`✅ Бот ${sessionId} зупиняється`);
        }
    }
};
