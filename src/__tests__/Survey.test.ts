import request from 'supertest';
import { getConnection } from 'typeorm';
import {app} from '../app'

import createConnection from '../database';

describe("Surveys", () => {
    beforeAll(async() => {
        const connection = await createConnection();
        await connection.runMigrations();
    });

    // após o teste dropa o database
    afterAll(async() => {
        const connection = getConnection();
        await connection.dropDatabase();
        await connection.close();
    })

    it("Show be able to create new survey", async () => {
        const response = await request(app).post("/surveys")
        .send({
            title: "Teste automatizado",
            description: "Test example of survey"
        });
        // espera que o retorno da função seja 201
        expect(response.status).toBe(201)
    })
    it("Show be able to get all surveys", async () => {
        await request(app).post("/surveys")
        .send({
            title: "Teste automatizado2",
            description: "Test example of survey2"
        });
        const response = await request(app).get('/surveys');

        // espera que o retorno da busca seja traga um array de tamanho 2
        expect(response.body.length).toBe(2)
    })
})