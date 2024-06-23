const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const cResult = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      code,
    ]);
    const iResult = await db.query(
      `SELECT * FROM invoices WHERE comp_code=$1`,
      [code]
    );
    if (cResult.rows.length === 0) {
      throw new ExpressError("Invalid Code name", 404);
    }
    return res.json({ company: cResult.rows[0], invoices: iResult.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const codeToPut = req.params.code;
    const { code, name, description } = req.body;
    const result = await db.query(
      "UPDATE companies SET code=$1, name=$2, description=$3 WHERE code =$4 RETURNING *",
      [code, name, description, codeToPut]
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
