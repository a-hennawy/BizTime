const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const date = new Date();

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
    const { amt, paid } = req.body;
    let paidDate = null;

    const currResult = await db.query(`SELECT paid FROM invoices WHERE id=$1`, [
      IDToPut,
    ]);
    if (currResult.rows[0].length === 0) {
      throw new ExpressError(`Invoice with id:#${IDToPut} is not registered`);
    }

    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }

    const result = await db.query(
      `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *`,
      [amt, paid, date, IDToPut]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    console.log(e);
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
