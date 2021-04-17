import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUserRepository } from "../repositories/SurveysUsersRepository";


class AnswerController {
    async execute(request: Request, response: Response) {
        // pegando dados da rota params e queryparams
        const { value } = request.params;
        const { u } = request.query;
        
        // busacndo no repositório
        const surveysUserRepository = getCustomRepository(SurveysUserRepository);

        // verificando se é um id válido
        const surveyUser = await surveysUserRepository.findOne({
            id: String(u)
        })
        // caso não exista
        if(!surveyUser) {
            // lançando erro acima até o app.ts
            throw new AppError("Survey User does not exists!");
        }
        
        surveyUser.value = Number(value);

        await surveysUserRepository.save(surveyUser);

        return response.json(surveyUser);
    }
}

export {AnswerController}