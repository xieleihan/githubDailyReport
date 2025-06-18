const sendEmail = require('./sendEmail');
const qq = require('./qq');

const PROJECT_NAME = qq.name;
const FROM_EMAIL = qq.email;

class Email {
    static delay = null;

    // 发送邮件
    static async sendqqEmail(client_email,body) {

        const email = {
            title: `${PROJECT_NAME}`,
            body: body
        };

        const emailContent = {
            from: FROM_EMAIL,
            to: client_email,
            subject: email.title,
            html: email.body,
        };

        try {
            // 发送邮件
            await sendEmail.send(emailContent);
        } catch (err) {
            console.error('发送邮件失败:', err);
        }
    }
}

module.exports = Email;