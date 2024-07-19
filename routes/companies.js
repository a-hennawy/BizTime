const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:c_code", async (req, res, next) => {
  try {
    const { c_code } = req.params;
    const results = await db.query(
      `
      SELECT c.code, c.name, c.description, i.industry
      FROM companies AS c
      LEFT JOIN companies_industries AS ci
      ON c.code = ci.comp_code
      LEFT JOIN industries AS i
      ON ci.industries_code = i.indust_code
      WHERE c.code = $1;
      `,
      [c_code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError("Invalid Code name", 404);
    }
    let { code, name, description } = results.rows[0];
    let industries = results.rows.map((r) => r.industry);
    if (industries[0] === null) {
      industries[0] = "No associated industries";
    }
    return res.json({ code, name, description, industries });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code } = req.body;
    const slugifiedCode = slugify(code, {
      replacement: "_",
      lower: true,
      strict: true,
    });
    const { name, description } = req.body;
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
      [slugifiedCode, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const codeToPut = req.params.code;
    const { code } = req.body;
    const slugifiedCode = slugify(code, {
      replacement: "_",
      lower: true,
      strict: true,
    });
    const { name, description } = req.body;
    const result = await db.query(
      "UPDATE companies SET code=$1, name=$2, description=$3 WHERE code =$4 RETURNING *",
      [slugifiedCode, name, description, codeToPut]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Invalid Code name", 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query("DELETE FROM companies WHERE code=$1", [
      code,
    ]);

    return res.json({ message: `Entry with code: ${code} has been DELETED` });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
