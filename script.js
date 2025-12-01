
import { GoogleGenAI } from "@google/genai";

// --- Data Constants ---
const RESUME_DATA = `
Имя: Alex Dev
Роль: CMS Architect / Web Master (Middle+ / Team Lead)
Основная ценность: Создаю готовые бизнес-решения на базе CMS, которые экономят бюджет и легко управляются.
Опыт: Более 3 лет коммерческой разработки.
Экспертиза по CMS (Разделено по платформам):
1. WordPress & WooCommerce:
   - Разработка кастомных плагинов под бизнес-логику (Hooks, Filters).
   - Интеграции через REST API (синхронизация остатков, заказов).
   - Оптимизация производительности: Query Monitor, Redis, серверное кэширование.
   - Безопасность и защита от взлома.
2. 1C-Bitrix (Битрикс):
   - Работа с D7 ядром и ORM.
   - Написание собственных компонентов и шаблонов.
   - Интеграция с 1С:Предприятие и платежными системами.
   - Композитный режим для ускорения.
3. OpenCart / MVC Frameworks:
   - Архитектура MVC (Model-View-Controller).
   - Модификация ядра через OCMOD/VQMOD.
   - Импорт/экспорт больших каталогов товаров.

Услуги (Services):
- Разработка под ключ (от ТЗ до релиза).
- Оптимизация скорости (PageSpeed, Redis, Caching).
- Интеграции API (CRM, Платежки, Логистика).
- Технический аудит и лечение вирусов/багов.

Процесс работы (Workflow):
1. Анализ (ТЗ, Архитектура).
2. Разработка (Git Flow, Staging сервер).
3. QA и Тесты (Нагрузка, Кроссбраузерность).
4. Релиз и Поддержка (Гарантия 1 месяц).

Общий Стек: PHP 8+, MySQL (оптимизация запросов), HTML5, SCSS, JS (ES6+), jQuery, Bootstrap 5.
Баланс навыков: Fullstack (60% Backend / 40% Frontend).
Зарплатные ожидания: $3,500/месяц или $25/час.
Обо мне: Инженер, который понимает, что бизнесу нужен не "код", а "продажи". Умею объяснять сложные вещи простым языком. Есть опыт руководства командой.
Проекты:
- Electro Market (WooCommerce): Тимлид, 15к товаров, синхронизация 1С.
- StroyGroup Portal (WordPress): Закрытый интранет, ACL роли, AD интеграция.
- Luxury Estate (Custom): Каталог недвижимости, ACF Pro, AJAX фильтры.
Контакты: alex.dev@example.com, Telegram, LinkedIn.
`;

// --- UI Logic with jQuery ---
$(document).ready(function() {
    // Initialize AOS
    AOS.init({
        once: true, // Animation happens only once - while scrolling down
        offset: 100, // Offset (in px) from the original trigger point
        duration: 800, // Values from 0 to 3000, with step 50ms
        easing: 'ease-out-cubic', // Default easing for AOS animations
    });

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

    // --- Stats Counter Animation ---
    let counted = false;
    const $counters = $('.counter');
    
    if ($counters.length) {
        $(window).on('scroll', function() {
            const statsSection = $counters.first().closest('section');
            if (!statsSection.length) return;

            const oTop = statsSection.offset().top - window.innerHeight;
            if (counted === false && $(window).scrollTop() > oTop) {
                $counters.each(function() {
                    const $this = $(this);
                    const countTo = $this.attr('data-target');
                    
                    $({ countNum: $this.text() }).animate({
                        countNum: countTo
                    },
                    {
                        duration: 2000,
                        easing: 'swing',
                        step: function() {
                            $this.text(Math.floor(this.countNum));
                        },
                        complete: function() {
                            $this.text(this.countNum + "+"); // Add + sign at the end
                            if (this.countNum == 98) $this.text("98"); // Lighthouse exception
                        }
                    });
                });
                counted = true;
            }
        });
    }


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
            addMessage("Приветствую! Я виртуальный ассистент Алекса. Расскажу, как Алекс может ускорить запуск вашего проекта на CMS. Что вас интересует?", "model");
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
                    <span>Анализирую...</span>
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
                    Ты AI HR-ассистент Алекса (Alex Dev).
                    Твоя цель - "продать" Алекса работодателю или клиенту как эксперта по CMS (WordPress, Bitrix).
                    
                    Данные резюме (RESUME_DATA):
                    ${RESUME_DATA}
                    
                    Правила:
                    1. Отвечай на РУССКОМ языке.
                    2. Будь кратким, уверенным и ориентированным на бизнес-пользу (экономия бюджета, скорость запуска).
                    3. Подчеркивай опыт кастомной разработки плагинов и оптимизации для каждой конкретной CMS, о которой спросят.
                    4. Если спрашивают про React/Node.js, говори честно, что Алекс специализируется на PHP/CMS, но знает JS для фронтенда.
                    5. Обязательно упоминай этапы работы (Git, тесты), если спрашивают про процессы.
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
