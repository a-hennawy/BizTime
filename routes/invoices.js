const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`User with id ${id} is Not Found`, 404);
    }
    return res.status(200).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt, paid, paid_date } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING comp_code, amt`,
      [comp_code, amt, paid, paid_date]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const IDToPut = req.params.id;
    const { amt } = req.body;
    const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2`, [
      amt,
      IDToPut,
    ]);
    if (result.rows.length === 0) {
      throw new ExpressError(`User with id ${id} is Not Found`, 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM invoices WHERE id=$1", [id]);
    return res.json({ message: `Invoice id ${id} DELETED` });
  } catch (e) {
    return next(e);
  }
});
module.exports = router;
