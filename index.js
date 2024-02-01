const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const PORT = process.env.PORT || 7000;
const { errorHandler } = require("./middleware/errorMiddleware");
require("./cron/cronJob");

// Middleware
app.use(express.json());
app.use(cors());

// Client build
app.use(express.static(path.join(__dirname, "client", "build")));

// Routes
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/expense", require("./routes/expenseRoute"));
app.use("/api/currency", require("./routes/currencyRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/transaction", require("./routes/transactionRoute"));
app.use("/api/recurring", require("./routes/recurringExpenseRoute"));

// Handle any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is serving on port - ${PORT}`));
