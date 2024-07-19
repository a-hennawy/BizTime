const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT i.industry_code, i.industry, c.code
        FROM industries AS i 
        LEFT JOIN companies_industries AS ci
        ON i.industry_code = ci.industries_code
        LEFT JOIN companies as c
        ON ci.comp_code=c.code
        `);
    let { industry_code, industry } = results.rows[0];
    let companyNames = results.rows.map((r) => r.code);
    if (companyNames[0] === null) {
      companyNames = "No companies associated";
    }
    return res.json({ industry_code, industry, companyNames });
    // return res.json({ Industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { industry_code, industry_name } = req.body;
    const results = await db.query(
      `INSERT INTO industries(industry_code, industry)
             VALUES ($1, $2) RETURNING *`,
      [industry_code, industry_name]
    );
    return res.json({ added: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
