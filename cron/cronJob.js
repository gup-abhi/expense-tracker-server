const cron = require("node-cron");
const dayjs = require("dayjs");
const axios = require("axios");
const {
  getRecurringExpensesDueToday,
  updateRecurringExpenseNextDueDate,
} = require("../controllers/recurringExpenseController");

const { addTransaction } = require("../controllers/expenseController");
const { getNextDueDate } = require("../utils/dateGenerator");

async function execute() {
  console.log("Cron job executed at:", new Date().toLocaleString());
  try {
    const response = await axios.get(
      "https://expense-tracker-server-ers4.onrender.com/api/category"
    );

    console.log(`response - ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(error);
  }
}

// This function should add the recurring expense to the transactions table
// You'll need to implement this based on your application's logic
async function addRecurringExpense() {
  // Get today's date
  const today = dayjs().format("YYYY-MM-DD");

  console.log(`today - ${today}`);

  // Get all recurring expenses where next_due_date is today
  // This will depend on how you're interfacing with your database
  const recurringExpenses = await getRecurringExpensesDueToday(today);

  // For each recurring expense...
  for (const expense of recurringExpenses) {
    // Add a new transaction with the details of the recurring expense
    await addTransaction(expense);

    // Update the next_due_date of the recurring expense
    const nextDueDate = getNextDueDate(
      expense.next_due_date,
      expense.frequency
    );
    await updateRecurringExpenseNextDueDate(expense.id, nextDueDate);
  }
}

// Schedule the cron job to run every minute
cron.schedule("*/12 * * * *", async () => {
  // addRecurringExpense();
  execute();
});

// Schedule the cron job to run every day at midnight
cron.schedule("0 0 * * *", addRecurringExpense);
