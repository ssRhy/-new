// script.js

// Popup functionality
function openPopup() {
    document.getElementById('popupOverlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}

// Daily quotes collection
const quotes = [
    { text: "生活中不是缺少美，而是缺少发现美的眼睛。", author: "罗丹" },
    { text: "人生就像一场马拉松，重要的不是瞬间的速度，而是坚持的耐力。", author: "佚名" },
    { text: "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。", author: "佚名" },
    { text: "当你的才华还撑不起你的野心时，你就应该静下心来学习。", author: "佚名" },
    { text: "没有人可以回到过去重新开始，但谁都可以从现在开始，书写一个全然不同的结局。", author: "佚名" },
    { text: "种一棵树最好的时间是十年前，其次是现在。", author: "中国谚语" },
    { text: "不要等待机会，而要创造机会。", author: "佚名" },
    { text: "做你害怕做的事情，然后你会发现，不过如此。", author: "佚名" },
    { text: "最困难的时候，也是离成功最近的时候。", author: "佚名" },
    { text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采" }
];

// Function to get a random quote
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

// Function to update the quote
function updateDailyQuote() {
    const quote = getRandomQuote();
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
}

// Close popup when clicking outside the card
document.addEventListener('DOMContentLoaded', function() {
    updateDailyQuote();
    
    const overlay = document.getElementById('popupOverlay');
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePopup();
        }
    });
});

document.getElementById('baziForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // 验证并获取表单数据
    const name = document.getElementById('name').value.trim();
    if (!name) {
        alert('请输入姓名');
        return;
    }

    const sex = parseInt(document.getElementById('sex').value);
    const type = parseInt(document.getElementById('type').value);
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const hours = parseInt(document.getElementById('hours').value);
    const minute = parseInt(document.getElementById('minute').value);

    // 验证数值范围
    if (isNaN(year) || year < 1900 || year > 2100) {
        alert('请输入有效的年份（1900-2100）');
        return;
    }
    if (isNaN(month) || month < 1 || month > 12) {
        alert('请输入有效的月份（1-12）');
        return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
        alert('请输入有效的日期（1-31）');
        return;
    }
    if (isNaN(hours) || hours < 0 || hours > 23) {
        alert('请输入有效的小时（0-23）');
        return;
    }
    if (isNaN(minute) || minute < 0 || minute > 59) {
        alert('请输入有效的分钟（0-59）');
        return;
    }

    // 构建URL参数
    const params = new URLSearchParams();
    const formData = {
        name,
        sex,
        type,
        year,
        month,
        day,
        hours,
        minute
    };

    // 验证所有数据是否有效
    for (const [key, value] of Object.entries(formData)) {
        if (value === undefined || value === null || value === '' || 
            (typeof value === 'number' && isNaN(value))) {
            alert(`请正确填写${key}`);
            return;
        }
        params.append(key, value);
    }

    // 跳转到结果页面
    window.location.href = `result.html?${params.toString()}`;
});
