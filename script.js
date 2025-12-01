
import { GoogleGenAI } from "@google/genai";

// --- Data Constants ---
const RESUME_DATA = `
Имя: Alex Dev
Роль: Веб-разработчик (Middle, стремлюсь к Senior)
Опыт: Более 3 лет коммерческой разработки.
Основной стек: HTML5, CSS3, JavaScript (ES6+), jQuery, Bootstrap 5.
Дополнительные инструменты: Git/GitHub, Webpack, SASS/SCSS, Figma (Pixel Perfect верстка), WebGL (базовый уровень Three.js), REST API.
Баланс навыков: Склоняюсь к Frontend (75%), но владею базой Backend (25%).
Зарплатные ожидания: $3,500/месяц или $25/час.
Обо мне: Преданный своему делу веб-разработчик. Гарантирую pixel-perfect верстку и кроссбраузерность. Хотя официально я Middle, качество моего кода и подход к работе соответствуют стандартам Senior.
Опыт руководства: Имею опыт руководства небольшой командой разработчиков (Тимлид), проводил Code Review, распределял задачи.
Путь / Таймлайн:
- 2024 - Наст. время: Тимлид / Менторство. Управление командой, обучение джуниоров, фокус на WebGL.
- 2022-2023: Middle Разработчик. Работа в команде над крупными E-commerce.
- 2020-2021: Junior Frontend. Самостоятельная верстка, старт карьеры.
Проекты:
1. Neon Admin Dashboard (Роль: Тимлид): Админ-панель с графиками. Я руководил командой из 2 джуниоров, строил архитектуру. Стек: Bootstrap 5, Chart.js.
2. TechGear Shop (Роль: Командный игрок): Интернет-магазин. Отвечал за корзину и чекаут в составе команды из 5 человек. Стек: jQuery, E-commerce логика.
3. Flow SaaS Landing (Роль: Соло): Маркетинговый лендинг. Сделал полностью сам "под ключ" (дизайн, верстка, анимации). Стек: CSS Animation, SEO оптимизация.
Хобби: Фотография (город/неон), Ретро гейминг (восстановление консолей), Создание музыки (Synth-wave).
Контакты: alex.dev@example.com, Telegram, LinkedIn.
Примечание: На сайте нет формы обратной связи, писать нужно напрямую.
`;

// --- UI Logic with jQuery ---
$(document).ready(function() {
    // Set Year
    $('#year').text(new Date().getFullYear());

    // Navbar Scroll Effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('#navbar').addClass('scrolled');
            $('.navbar-brand').addClass('fs-4').removeClass('fs-3');
        } else {
            $('#navbar').removeClass('scrolled');
            $('.navbar-brand').removeClass('fs-4').addClass('fs-3');
        }
    });

    // Smooth Scrolling for Anchor Links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80 // Offset for navbar
            }, 100); 
            
            // Close mobile menu if open
            $('.navbar-collapse').collapse('hide');
        }
    });

    // --- Gemini Chat Widget Logic ---
    let isChatOpen = false;
    let chatHistory = [];
    const $chatWindow = $('#chat-window');
    const $chatToggle = $('#chat-toggle');
    const $chatMessages = $('#chat-messages');
    const $chatInput = $('#chat-input');
    const $sendBtn = $('#send-btn');
    const $closeChat = $('#close-chat');

    // Add Initial Greeting
    setTimeout(() => {
        if ($chatMessages.children().length === 0) {
            addMessage("Привет! Я AI ассистент Алекса. Спроси меня о его стеке технологий, опыте или ставке! 🤖", "model");
        }
    }, 500);

    // Toggle Chat
    $chatToggle.on('click', function() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            $chatWindow.removeClass('d-none');
            $chatToggle.addClass('d-none'); // Hide toggle button when open
            // Scroll to bottom
            scrollToBottom();
            // Focus input
            setTimeout(() => $chatInput.focus(), 100);
        }
    });

    // Close Chat
    $closeChat.on('click', function() {
        isChatOpen = false;
        $chatWindow.addClass('d-none');
        $chatToggle.removeClass('d-none');
    });

    function scrollToBottom() {
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
    }

    function addMessage(text, sender) {
        const bubbleClass = sender === 'user' ? 'user' : 'model';
        const justifyClass = sender === 'user' ? 'justify-content-end' : 'justify-content-start';
        
        const html = `
            <div class="d-flex ${justifyClass}">
                <div class="message-bubble ${bubbleClass}">
                    ${text}
                </div>
            </div>
        `;
        $chatMessages.append(html);
        scrollToBottom();
    }

    function addLoadingIndicator() {
        const html = `
            <div class="d-flex justify-content-start" id="loading-indicator">
                <div class="message-bubble model d-flex align-items-center gap-2">
                    <div class="spinner-border spinner-border-sm text-light" role="status"></div>
                    <span>Думаю...</span>
                </div>
            </div>
        `;
        $chatMessages.append(html);
        scrollToBottom();
    }

    function removeLoadingIndicator() {
        $('#loading-indicator').remove();
    }

    // Gemini API Client
    let aiClient = null;
    const getClient = () => {
        if (!aiClient) {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                console.error("API_KEY is missing");
                addMessage("Ошибка: API Key отсутствует.", "model");
                return null;
            }
            aiClient = new GoogleGenAI({ apiKey });
        }
        return aiClient;
    };

    // Handle Form Submit
    $('#chat-form').on('submit', async function(e) {
        e.preventDefault();
        const message = $chatInput.val().trim();
        if (!message) return;

        // Clear input and disable
        $chatInput.val('');
        $chatInput.prop('disabled', true);
        $sendBtn.prop('disabled', true);

        // Add User Message
        addMessage(message, 'user');
        
        // Add Loading
        addLoadingIndicator();

        try {
            const client = getClient();
            if (client) {
                // System Instruction
                const systemInstruction = `
                    Ты AI ассистент для сайта-портфолио веб-разработчика Алекса (Alex Dev).
                    Твоя цель - отвечать на вопросы о его профессиональном опыте, навыках, ставках и проектах, основываясь ТОЛЬКО на данных ниже.
                    
                    Данные резюме (RESUME_DATA):
                    ${RESUME_DATA}
                    
                    Правила:
                    1. Отвечай на РУССКОМ языке.
                    2. Будь вежливым, кратким и профессиональным (обычно 2-3 предложения).
                    3. Если спросят о руководстве, обязательно упомяни опыт Тимлида.
                    4. Если не знаешь ответа на основе данных, вежливо скажи об этом.
                `;
                
                const response = await client.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        ...chatHistory.map(m => ({
                            role: m.role,
                            parts: [{ text: m.text }]
                        })),
                        { role: 'user', parts: [{ text: message }] }
                    ],
                    config: {
                        systemInstruction: systemInstruction,
                    }
                });

                const reply = response.text;
                
                removeLoadingIndicator();
                addMessage(reply, 'model');

                // Update History
                chatHistory.push({ role: 'user', text: message });
                chatHistory.push({ role: 'model', text: reply });

            } 
        } catch (error) {
            console.error(error);
            removeLoadingIndicator();
            addMessage("Извините, сейчас я не могу подключиться к серверу AI.", "model");
        } finally {
            $chatInput.prop('disabled', false);
            $sendBtn.prop('disabled', false);
            $chatInput.focus();
        }
    });
});
