import request from 'supertest';
import { getConnection } from 'typeorm';
import {app} from '../app'

import createConnection from '../database';

describe("Users", () => {
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

    it("Show be able to create new user", async () => {
        const response = await request(app).post("/users")
        .send({
            email: "teste45777@gmail.com",
            name: "Teste example"
        });
        // espera que o retorno da função seja 201
        expect(response.status).toBe(201)
    })
})