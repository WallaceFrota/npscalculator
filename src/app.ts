import express, {Request, NextFunction, Response } from 'express';
import 'express-async-errors'
import createConnection from './database';
import { AppError } from './errors/AppError';
import router from './routes';

createConnection();
const app = express();

app.use(express.json());
app.use(router);

// middleware para retornar/lançar os erros
app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
    // verificando se o erro for do tipo da instacia de apperror
    if(err instanceof AppError) {
        return response.status(err.statusCode).json({
            message: err.message
        })
    }
    // se não
    return response.status(500).json({status: "Error", message: `Internal server error ${err.message}`})
})

export {app}