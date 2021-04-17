import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { Transporter } from 'nodemailer';

class SendMailService {
    // atributo
    private client: Transporter

    constructor() {
        // criação de conta nodemailer / teste
        nodemailer.createTestAccount().then(account => {
            // criando o transporte SMTP de e-mail
            const transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass
                }
            });
            // salvando dentro do atributo
            this.client = transporter;
        })


    }
    // metodo
    async execute(to: string, subject: string, variables: object, path: string) {
        // lendo arquivo
        const templateFile = fs.readFileSync(path).toString('utf8');
        // repassando para o handlebars
        const mailTemplateParse = handlebars.compile(templateFile)
        const html = mailTemplateParse(variables)

        // retorno da mensagem enviada
        const message = await this.client.sendMail({
            to,
            subject,
            html,
            from: "FrotaDev <noreply@frota.dev>"
        });
        
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
    }

}
export default new SendMailService();
