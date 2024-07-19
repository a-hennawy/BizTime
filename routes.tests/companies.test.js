process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const req = require("express/lib/request");

let testUser;

beforeEach(async () => {
  const results = await db.query(
    `
        INSERT INTO companies (code, name, description) 
        VALUES ('HP', 'Hewlett Packard', 'Maker of well-known HP laptops'), 
        ('cisco', 'Cisco', 'Pioneer in server and network solutions')
        RETURNING *
        `
  );
  testUser = results.rows;
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("Testing GET routes", () => {
  test("Get a list of companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: testUser });
  });
  test("Get a company using its company code", async () => {
    const company = testUser[0];
    const res = await request(app).get(`/companies/${company.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: company.code,
        name: company.name,
        description: company.description,
      },
      invoices: expect.any(Array),
    });
  });
});

describe(" Testing POST route", () => {
  test("Adds a new company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "TEST", name: "TEST", description: "TEST" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "TEST",
        name: "TEST",
        description: "TEST",
      },
    });
  });
});

describe("Testing PUT route", () => {
  test("UPDATING a company", async () => {
    const res = await request(app)
      .put(`/companies/${testUser[0].code}`)
      .send({ code: "newTESTU", name: "TESTU", description: "TEST describe" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: "newTESTU",
        name: "TESTU",
        description: "TEST describe",
      },
    });
  });
});

describe("Testing DELETE route", () => {
  test("DELETE a company", async () => {
    const compCode = testUser[0].code;
    const res = await request(app).delete(`/companies/${testUser[0].code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: `Entry with code: ${compCode} has been DELETED`,
    });
  });
});
