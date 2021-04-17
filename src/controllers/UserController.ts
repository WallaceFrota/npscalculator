import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UsersRepository } from '../repositories/UsersRepository';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

class UserController {
    async create(request: Request, response: Response) {
        // dados recebidos no corpo
        const {name, email} = request.body;

        // validação de entradas
        const schema = yup.object().shape({
            name: yup.string().required("Nome é obrigatório"),
            email: yup.string().email().required()
        })
        // validando primeira opção de validação
        // if(!(await schema.isValid(request.body))) {
        //     return response.status(400).json({
        //         error: "Validation failed!"
        //     })
        // }
        // segunda forma de validar
        try {
            await schema.validate(request.body, {abortEarly: false});
        } catch (err) {
            throw new AppError(err);
        }

        // permitir manipular o banco de dados a partir da entidade User
        const usersRepository = getCustomRepository(UsersRepository);

        // verifica se existe usuário já cadastrado com e-mail
        const userAlreadyExists = await usersRepository.findOne({
            email
        })
        if(userAlreadyExists) {
            // lançando erro
            throw new AppError("User already exists!");
        }
        // criando usuário antes de salvar
        const user = usersRepository.create({
            name,
            email
        });

        // salvando no bd
        await usersRepository.save(user);

        return response.status(201).json(user);
    }
}
export { UserController };
