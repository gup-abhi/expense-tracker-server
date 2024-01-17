const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 7000;
const { errorHandler } = require("./middleware/errorMiddleware");

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/expense", require("./routes/expenseRoute"));

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is serving on port - ${PORT}`));
