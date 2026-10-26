class EmailAdapter {
  constructor(vendor) { this.vendor = vendor; }
  send(receiver, message) {
    try { return this.vendor({to: receiver, html: message}) === 202 ? "sent" : "failed"; }
    catch (error) { return "failed"; }
  }
}
module.exports = {EmailAdapter};
