// 从URL获取参数
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const data = {};
    console.log('Raw URL parameters:', Object.fromEntries(params));
    
    for(const [key, value] of params) {
        // 转换数值类型的参数
        if (['sex', 'type', 'year', 'month', 'day', 'hours', 'minute'].includes(key)) {
            data[key] = parseInt(value, 10);
            console.log(`Converting ${key} to number:`, value, '->', data[key]);
        } else {
            data[key] = value;
        }
    }
    console.log('Processed parameters:', data);
    return data;
}

// 页面加载时执行分析
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Page loaded, starting analysis...');
    const params = getQueryParams();
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    // 验证必要的参数是否存在
    const requiredParams = ['name', 'sex', 'type', 'year', 'month', 'day', 'hours', 'minute'];
    const missingParams = requiredParams.filter(param => params[param] === undefined || params[param] === null);
    
    if (missingParams.length > 0) {
        const error = `缺少必要参数: ${missingParams.join(', ')}`;
        console.error(error);
        results.innerHTML = `<div class="error">${error}</div>`;
        loading.classList.remove('active');
        return;
    }

    try {
        console.log('Sending request to server with data:', params);
        // 设置请求超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

        const response = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: params.name,
                sex: params.sex,
                type: params.type,
                year: params.year,
                month: params.month,
                day: params.day,
                hours: params.hours,
                minute: params.minute
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Server response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}\nResponse: ${errorText}`);
        }

        const data = await response.json();
        console.log('Server response data:', data);

        if (data.error) {
            console.error('Server returned error:', data.error);
            results.innerHTML = `<div class="error">错误: ${data.error}</div>`;
            loading.classList.remove('active');
            return;
        }

        // 格式化五行强弱数据
        const wuxingStrength = Object.entries(data.五行强弱)
            .map(([element, value]) => `${element}: ${value.toFixed(1)}`)
            .join('\n');

        let result = `
            <div class="result-section">
                <h3>基本信息</h3>
                <p>八字：${data.八字}</p>
                <p>日主：${data.日主}</p>
            </div>
        `;

        // 添加五行分析可视化
        if (data.五行强弱) {
            result += `
                <div class="result-section">
                    <h3>五行分析</h3>
                    <div class="wuxing-chart">
                        <div class="element-circle element-wood">
                            木
                            <span class="element-value">${data.五行强弱['木']?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div class="element-circle element-fire">
                            火
                            <span class="element-value">${data.五行强弱['火']?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div class="element-circle element-earth">
                            土
                            <span class="element-value">${data.五行强弱['土']?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div class="element-circle element-metal">
                            金
                            <span class="element-value">${data.五行强弱['金']?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div class="element-circle element-water">
                            水
                            <span class="element-value">${data.五行强弱['水']?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div class="relationship-line"></div>
                    </div>
                </div>
            `;
        }

        // 五行喜忌信息
        result += `
            <div class="result-section">
                <h3>五行喜忌</h3>
                <div class="wuxing-info">
                    <div class="wuxing-item">
                        <div class="wuxing-item-title">喜用神</div>
                        <div class="wuxing-item-content">${data.五行喜忌.喜用神}</div>
                    </div>
                    <div class="wuxing-item">
                        <div class="wuxing-item-title">忌神</div>
                        <div class="wuxing-item-content">${data.五行喜忌.忌神}</div>
                    </div>
                </div>
            </div>
        `;

        // 今日干支显示
        if (data.今日天干) {
            result += `
                <div class="result-section">
                    <h3>今日干支</h3>
                    <div class="today-ganzhi">
                        <p>天干：<span class="tiangan">${data.今日天干[0] || '未知'}</span></p>
                        <p>地支：<span class="dizhi">${data.今日天干[1] || '未知'}</span></p>
                    </div>
                </div>
            `;
        }

        result += `
            <div class="result-section">
                <h3>幸运数字</h3>
                <div class="lucky-numbers">
                    ${Array.isArray(data.幸运数字) && data.幸运数字.length > 0 ? 
                        `<p>您的幸运数字是：<span class="numbers">${data.幸运数字.join('、')}</span></p>` : 
                        '<p>暂无幸运数字推荐</p>'
                    }
                </div>
            </div>

            <div class="result-section">
                <h3>今日幸运色</h3>
                <div class="lucky-color">
                    <div class="color-display" style="background-color: ${data.幸运颜色.color}">
                        
                    </div>
                    <p class="color-strategy">${data.幸运颜色.strategy}</p>
                </div>
            </div>
        `;

        // 水晶推荐
        if (data.喜用神_天干 && data.喜用神_天干.length > 0) {
            result += `
                <div class="result-section">
                    <h3>喜用神水晶推荐</h3>
                    <div class="crystal-recommendations">
                        <ul>
                            ${data.喜用神_天干.map(crystal => {
                                const [name, description] = crystal.split(':');
                                return `<li><strong>${name}</strong>${description ? `: ${description}` : ''}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // 五行缺失分析
        if (data.五行_水晶) {
            result += `
                <div class="result-section">
                    <h3>五行缺失分析</h3>
                    <div class="wuxing-deficiency">
                        ${data.五行_水晶.缺失五行.length > 0 ? `
                            <p>缺失五行: ${data.五行_水晶.缺失五行.join('、')}</p>
                            <div class="crystal-recommendations">
                                <h4>补充建议</h4>
                                ${Object.entries(data.五行_水晶.推荐补充水晶).map(([element, crystals]) => `
                                    <div class="element-crystals">
                                        <h5>${element}相关水晶:</h5>
                                        <ul>
                                            ${crystals.map(crystal => {
                                                const [name, description] = crystal.split(':');
                                                return `<li><strong>${name}</strong>${description ? `: ${description}` : ''}</li>`;
                                            }).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p>五行均衡，无明显缺失。</p>'}
                    </div>
                </div>
            `;
        }

        // 推荐活动
        if (data.推荐活动 && !data.推荐活动.error) {
            result += `
                <div class="result-section">
                    <h3>每日推荐活动</h3>
                    <div class="daily-activities">
                        <div class="activities-section">
                            <h4>基于${data.推荐活动.喜用神}五行的推荐活动：</h4>
                            <ul class="activities-list main-activities">
                                ${Array.isArray(data.推荐活动.推荐活动) ? 
                                    data.推荐活动.推荐活动.map(activity => 
                                        `<li>${activity}</li>`
                                    ).join('') : '<li>暂无推荐活动</li>'}
                            </ul>
                        </div>
                        ${Array.isArray(data.推荐活动.五行缺失活动) && data.推荐活动.五行缺失活动.length > 0 ? `
                            <div class="activities-section">
                                <h4>五行平衡补充活动：</h4>
                                <ul class="activities-list supplementary-activities">
                                    ${data.推荐活动.五行缺失活动.map(activity => 
                                        `<li>${activity}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        results.innerHTML = result;
        results.classList.add('active');
        loading.classList.remove('active');

    } catch (error) {
        let errorMessage = '请求失败';
        if (error.name === 'AbortError') {
            errorMessage = '请求超时，请稍后重试';
        } else if (error.message) {
            errorMessage = error.message;
        }
        console.error('错误:', error);
        results.innerHTML = `<div class="error">${errorMessage}</div>`;
        loading.classList.remove('active');
    }
});
