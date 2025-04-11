// Système d'événements pour propager les mises à jour de transactions
export type TransactionEventType = "deposit" | "purchase" | "withdrawal" | "earnings" | "commission"

export interface TransactionEvent {
  type: TransactionEventType
  userId: string
  amount: number
  transactionId: string
  metadata?: Record<string, any>
}

// Gestionnaires d'événements par type
const eventHandlers: Record<TransactionEventType, Array<(event: TransactionEvent) => Promise<void>>> = {
  deposit: [],
  purchase: [],
  withdrawal: [],
  earnings: [],
  commission: [],
}

// Enregistrer un gestionnaire d'événements
export function registerTransactionHandler(
  type: TransactionEventType,
  handler: (event: TransactionEvent) => Promise<void>,
) {
  eventHandlers[type].push(handler)
  console.log(`Handler registered for ${type} events`)
}

// Déclencher un événement de transaction
export async function emitTransactionEvent(event: TransactionEvent) {
  console.log(`Emitting ${event.type} event for user ${event.userId}:`, event)

  try {
    // Exécuter tous les gestionnaires pour ce type d'événement
    const handlers = eventHandlers[event.type]
    await Promise.all(handlers.map((handler) => handler(event)))

    // Déclencher également un événement global pour les mises à jour d'interface
    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent("transaction-update", {
        detail: {
          type: event.type,
          userId: event.userId,
        },
      })
      window.dispatchEvent(customEvent)
    }

    console.log(`Successfully processed ${event.type} event`)
  } catch (error) {
    console.error(`Error processing ${event.type} event:`, error)
  }
}

// Initialiser les gestionnaires d'événements par défaut
export function initializeTransactionEvents() {
  // Ces gestionnaires seraient définis dans d'autres fichiers et importés ici
  console.log("Transaction event system initialized")
}
