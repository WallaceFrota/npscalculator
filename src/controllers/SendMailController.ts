import {Request, Response} from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUserRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';
import path from 'path';
import { AppError } from '../errors/AppError';

class SendMailController {
    async execute(request: Request, response: Response) {
        const {email, survey_id} = request.body;

        // repositorios para verificar se é um user e se existe a pesquisa
        const userRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUserRepository);

        // verifica usuário
        const userAlreadyExists = await userRepository.findOne({where: {email: email}});
        if(!userAlreadyExists) {
            // lançando erro
            throw new AppError("User does not exists!");
        }
        // verifica pesquisa
        const survey = await surveysRepository.findOne({id: survey_id});
        if(!survey) {
            // lançando erro
            throw new AppError("Survey does not exists!");
        }
        
        // arquivo template de email
        const mailPath = path.resolve(__dirname, '..', 'views', 'emails', 'surveyMail.hbs');

        // verifica se usuário já tem a pesquisa na tabela
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [{user_id: userAlreadyExists.id}, {value: null}],
            relations: ["user", "survey"]
        });

        // variaveis
        const variables = {
            name: userAlreadyExists.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        // se existe retorna enviando e-mail novamente
        if(surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, mailPath);
            return response.json(surveyUserAlreadyExists);
        }

        // salvando as informações na tabela de pesquisa/usuário
        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id: survey.id
        })
        await surveysUsersRepository.save(surveyUser);

        // enviando e-mail repassando dados
        variables.id = surveyUser.id;
        await SendMailService.execute(email, survey.title, variables, mailPath);

        return response.json(surveyUser);
    }
}

export {SendMailController}