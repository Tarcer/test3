// Stub pour remplacer coinbase-commerce-node
console.warn("Module coinbase-commerce-node remplacé par un stub")

exports.Client = class {
  constructor() {
    console.warn("Coinbase Commerce n'est plus utilisé dans cette application.")
  }

  createCharge() {
    throw new Error("Coinbase Commerce n'est plus utilisé dans cette application.")
  }
}

exports.Webhook = {
  verifyEventBody: () => {
    throw new Error("Coinbase Commerce n'est plus utilisé dans cette application.")
  },
}

module.exports.default = module.exports
