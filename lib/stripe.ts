// Ce fichier est un stub pour éviter les erreurs de build
// À terme, nous devrions identifier et corriger toutes les références à ce module

// Créer un objet factice pour éviter les erreurs de build
export const stripe = {
  checkout: {
    sessions: {
      create: async () => {
        throw new Error("Cette fonctionnalité a été désactivée.")
      },
    },
  },
  balance: {
    retrieve: async () => {
      throw new Error("Cette fonctionnalité a été désactivée.")
    },
  },
  webhooks: {
    constructEvent: () => {
      throw new Error("Cette fonctionnalité a été désactivée.")
    },
  },
}
