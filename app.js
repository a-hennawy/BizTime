const express = require("express");
const app = express();
const ExpressError = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");
const industriesRoutes = require("./routes/industries");
app.use(express.json());

//Routing
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/industries", industriesRoutes);
//Error handling
app.use((req, res, next) => {
  const err = new ExpressError("Not Found", 404);

  return next(err);
});

app.use((err, req, res, next) => {
  let status = err.status || 500;

  return res.status(status).json({
    error: {
      message: err.message,
      status: status,
    },
  });
});

module.exports = app;
