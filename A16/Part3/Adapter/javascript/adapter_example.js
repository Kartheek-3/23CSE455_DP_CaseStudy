class LegacyGateway {
  authorize(amountDollars) {
    return `legacy-${amountDollars.toFixed(2)}`;
  }
}

class LegacyGatewayAdapter {
  constructor(gateway) {
    this.gateway = gateway;
  }

  charge(amountCents) {
    return {
      status: 'APPROVED',
      amountCents,
      reference: this.gateway.authorize(amountCents / 100),
    };
  }
}

function asLine(receipt) {
  return `status=${receipt.status},amount_cents=${receipt.amountCents},reference=${receipt.reference}`;
}

function result() {
  return new LegacyGatewayAdapter(new LegacyGateway()).charge(2599);
}

if (require.main === module) {
  console.log(asLine(result()));
}

module.exports = { LegacyGateway, LegacyGatewayAdapter, asLine, result };
