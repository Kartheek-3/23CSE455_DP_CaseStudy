// Exercise the actual template script using Node's VM and minimal DOM/network doubles.
// This is not a browser rendering or live HTTP test.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../working/canteenapp/templates/adminassignorder.html'), 'utf8');
const script = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
function setup() {
    const elements = {
        'assignment-policy': {value: 'manual'},
        'deliverypersonnel': {value: 'driver@example.test', disabled: false},
        'assignment-policy-help': {textContent: ''},
        'assigndeliveryPersonnel': {disabled: false},
    };
    const messages = [], requests = [];
    let refreshes = 0;
    const context = vm.createContext({
        console, document: {getElementById: id => elements[id], addEventListener() {}},
        showMessage: (...args) => messages.push(args),
        fetch: async (...args) => { requests.push(args); return {ok: true, json: async () => ({success:true})}; },
    });
    vm.runInContext(script, context);
    context.getCookie = () => 'test-csrf';
    context.getToBeAssignedOrders = () => {refreshes++;};
    vm.runInContext("ordersData = [{order_id:'FIRST'}, {order_id:'SELECTED'}]; currentOrderIndex = 1;", context);
    return {context, elements, messages, requests, refreshes: () => refreshes};
}
const tests = {
    async manual_posts_selected_order_and_email() {
        const t = setup(); await t.context.assignDeliveryPersonnel();
        const [url, request] = t.requests[0];
        assert.equal(url, '/adminassignordertodelivery/');
        assert.deepEqual(JSON.parse(request.body), {order_id:'SELECTED', policy:'manual', delivery_personnel:'driver@example.test'});
        assert.equal(request.headers['X-CSRFToken'], 'test-csrf');
        assert.equal(t.refreshes(), 1);
    },
    async automatic_posts_without_manual_email() {
        const t = setup(); t.elements['assignment-policy'].value = 'least_workload';
        await t.context.assignDeliveryPersonnel();
        assert.deepEqual(JSON.parse(t.requests[0][1].body), {order_id:'SELECTED', policy:'least_workload'});
    },
    async policy_toggle_disables_and_reenables_manual_selection() {
        const t = setup(); t.elements['assignment-policy'].value = 'least_workload';
        t.context.updateAssignmentPolicy();
        assert.equal(t.elements.deliverypersonnel.disabled, true);
        assert.match(t.elements['assignment-policy-help'].textContent, /lowest user ID/);
        t.elements['assignment-policy'].value = 'manual'; t.context.updateAssignmentPolicy();
        assert.equal(t.elements.deliverypersonnel.disabled, false);
    },
    async empty_manual_selection_is_blocked() {
        const t = setup(); t.elements.deliverypersonnel.value = '';
        await t.context.assignDeliveryPersonnel(); assert.equal(t.requests.length, 0);
        assert.match(t.messages[0][0], /Select a delivery person/);
    },
    async no_order_is_blocked() {
        const t = setup(); vm.runInContext('currentOrderIndex = -1;', t.context);
        await t.context.assignDeliveryPersonnel(); assert.equal(t.requests.length, 0);
        assert.match(t.messages[0][0], /Select an order/);
    },
    async server_error_is_displayed_and_button_restored() {
        const t = setup(); t.context.fetch = async () => ({ok:false, json:async () => ({success:false, error:'No eligible delivery people are available.'})});
        await t.context.assignDeliveryPersonnel();
        assert.equal(t.messages[0][0], 'No eligible delivery people are available.');
        assert.equal(t.elements.assigndeliveryPersonnel.disabled, false);
        assert.equal(t.refreshes(), 0);
    },
    async network_failure_requests_reload_before_retry() {
        const t = setup(); t.context.fetch = async () => {throw Error('network failure');};
        await t.context.assignDeliveryPersonnel();
        assert.match(t.messages[0][0], /Reload before retrying/);
        assert.equal(t.elements.assigndeliveryPersonnel.disabled, false);
    },
    async non_json_response_restores_button() {
        const t = setup(); t.context.fetch = async () => ({ok:false, json:async () => {throw Error('HTML');}});
        await t.context.assignDeliveryPersonnel();
        assert.equal(t.elements.assigndeliveryPersonnel.disabled, false);
        assert.match(t.messages[0][0], /Reload before retrying/);
    },
    async concurrent_click_is_ignored_while_pending() {
        const t = setup(); let resolve; let calls = 0;
        t.context.fetch = () => {calls++; return new Promise(r => {resolve = r;});};
        const first = t.context.assignDeliveryPersonnel();
        await t.context.assignDeliveryPersonnel(); assert.equal(calls, 1);
        resolve({ok:true, json:async () => ({success:true})}); await first;
        assert.equal(t.elements.assigndeliveryPersonnel.disabled, false);
    },
};
(async () => {
    let passed = 0;
    for (const [name, run] of Object.entries(tests)) {
        await run(); passed++; console.log(`PASS ${name}`);
    }
    console.log(`${passed} UI script tests passed (VM/DOM doubles; no browser).`);
})().catch(error => {console.error(error); process.exitCode = 1;});
