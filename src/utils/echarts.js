const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateEchartsImage(data) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("✅ Puppeteer 启动成功,传递的数据是", data);

    const chartHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nightingale Chart</title>
      <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.0/dist/echarts.min.js"></script> 
      <style>
        html, body { margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="main" style="width: 800px; height: 600px;"></div>
      <script>
        const chart = echarts.init(document.getElementById('main'));
        const option = {
          title: {
            text: '技术栈占比',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: 'bottom'
        },
        toolbox: {
              show: true,
              feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: true }
              }
        },
          series: [{
            name: '数据',
            type: 'pie',
            radius: ['10%', '70%'],
            center: ['50%', '55%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 5,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            data: ${JSON.stringify(data)}
          }]
        };
        chart.setOption(option);
        chart.on('finished', () => {
          window.__echarts_rendered__ = true;
        });
      </script>
    </body>
    </html>
  `;

    await page.setContent(chartHtml, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction('window.__echarts_rendered__ === true', { timeout: 3000 });

    // 定义图片保存路径
    const imagePath = path.resolve(__dirname, '../images/nightingale-chart.png');

    // 确保目录存在，如果不存在则创建
    const imageDir = path.dirname(imagePath);
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // 截图并保存到指定路径
    await page.screenshot({ path: imagePath });

    console.log(`✅ 图表已保存为 ${imagePath}`);
    await browser.close();
}

module.exports = generateEchartsImage;