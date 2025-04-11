// This is a new file, so we will create a basic structure.
// Based on the instructions, we need to remove reference_id and reference_type fields.
// Since we don't have an existing structure, we'll create a placeholder and then modify it.

// Placeholder interface (to be modified)
interface Transaction {
  id: string
  amount: number
  date: Date
  description: string
  reference_id: string // To be removed
  reference_type: string // To be removed
  other_field: string
}

// Modified interface (after removing reference_id and reference_type)
interface UpdatedTransaction {
  id: string
  amount: number
  date: Date
  description: string
  other_field: string
}

// Placeholder function (to be modified)
function processTransaction(transaction: Transaction): UpdatedTransaction {
  // Remove reference_id and reference_type
  const { reference_id, reference_type, ...updatedTransaction } = transaction

  return updatedTransaction
}

// Example usage (to be modified)
const initialTransaction: Transaction = {
  id: "123",
  amount: 100,
  date: new Date(),
  description: "Test transaction",
  reference_id: "ref123",
  reference_type: "typeA",
  other_field: "some value",
}

const updatedTransaction: UpdatedTransaction = processTransaction(initialTransaction)

console.log(updatedTransaction)

export {}
