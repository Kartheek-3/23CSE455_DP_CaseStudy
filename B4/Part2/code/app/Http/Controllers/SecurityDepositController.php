<?php

namespace App\Http\Controllers;

use App\Models\SecurityDeposit;
use App\Models\SecurityDepositDeduction;
use App\Models\Property;
use App\Http\Requests\StoreSecurityDepositRequest;
use App\Http\Requests\UpdateSecurityDepositRequest;
use Illuminate\Http\Request;

class SecurityDepositController extends Controller
{
    public function index()
    {
        $deposits = SecurityDeposit::with(['property', 'tenant', 'owner'])
            ->latest()
            ->paginate(15);

        return view('security-deposits.index', compact('deposits'));
    }

    public function create()
    {
        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('security-deposits.create', compact('properties'));
    }

    public function store(StoreSecurityDepositRequest $request)
    {
        $property = Property::with(['owner', 'tenant'])->findOrFail($request->property_id);

        SecurityDeposit::create([
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'total_amount' => $request->total_amount,
            'months_count' => $request->months_count,
            'monthly_rent_at_time' => $request->monthly_rent_at_time,
            'amount_in_words' => $request->amount_in_words,
            'deposit_date' => $request->deposit_date,
            'payment_method' => $request->payment_method,
            'status' => 'held',
            'total_deductions' => 0,
            'refunded_amount' => 0,
            'balance' => $request->total_amount,
            'notes' => $request->notes,
        ]);

        return redirect()->route('security-deposits.index')
            ->with('success', 'Security deposit recorded successfully.');
    }

    public function show(SecurityDeposit $securityDeposit)
    {
        $securityDeposit->load(['property', 'tenant', 'owner', 'deductions']);
        return view('security-deposits.show', compact('securityDeposit'));
    }

    public function edit(SecurityDeposit $securityDeposit)
    {
        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('security-deposits.edit', compact('securityDeposit', 'properties'));
    }

    public function update(UpdateSecurityDepositRequest $request, SecurityDeposit $securityDeposit)
    {
        $securityDeposit->update([
            'total_amount' => $request->total_amount,
            'months_count' => $request->months_count,
            'monthly_rent_at_time' => $request->monthly_rent_at_time,
            'amount_in_words' => $request->amount_in_words,
            'deposit_date' => $request->deposit_date,
            'payment_method' => $request->payment_method,
            'notes' => $request->notes,
        ]);

        return redirect()->route('security-deposits.show', $securityDeposit)
            ->with('success', 'Security deposit updated.');
    }

    public function destroy(SecurityDeposit $securityDeposit)
    {
        $securityDeposit->delete();

        return redirect()->route('security-deposits.index')
            ->with('success', 'Security deposit deleted.');
    }

    // ── ADD DEDUCTION ────────────────────────────
    public function addDeduction(Request $request, SecurityDeposit $securityDeposit)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:' . $securityDeposit->balance,
            'reason' => 'required|string|max:255',
            'deduction_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = [
            'security_deposit_id' => $securityDeposit->id,
            'amount' => $request->amount,
            'reason' => $request->reason,
            'deduction_date' => $request->deduction_date,
            'notes' => $request->notes,
        ];

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')
                ->store('deduction-attachments', 'public');
        }

        SecurityDepositDeduction::create($data);

        // Recalculate deposit totals
        $securityDeposit->recalculateDeductions();

        return redirect()->route('security-deposits.show', $securityDeposit)
            ->with('success', 'Deduction of Rs. ' . number_format($request->amount) . ' added.');
    }

    // ── PROCESS REFUND ───────────────────────────
    public function processRefund(Request $request, SecurityDeposit $securityDeposit)
    {
        $request->validate([
            'refund_amount' => 'required|numeric|min:0|max:' . $securityDeposit->balance,
            'refund_date' => 'required|date',
            'refund_notes' => 'nullable|string|max:500',
        ]);

        $refundAmount = $request->refund_amount;

        $securityDeposit->update([
            'refunded_amount' => $securityDeposit->refunded_amount + $refundAmount,
            'refund_date' => $request->refund_date,
            'status' => ($securityDeposit->balance - $refundAmount) <= 0
                ? 'fully_refunded'
                : 'partially_refunded',
            'notes' => $securityDeposit->notes
                . "\n[Refund " . now()->format('d/m/Y') . "] Rs. " . number_format($refundAmount)
                . " refunded. " . ($request->refund_notes ?? ''),
        ]);

        return redirect()->route('security-deposits.show', $securityDeposit)
            ->with('success', 'Rs. ' . number_format($refundAmount) . ' refunded successfully.');
    }

    // ── PDF ──────────────────────────────────────
    public function downloadPdf(SecurityDeposit $securityDeposit)
    {
        $securityDeposit->load(['property', 'tenant', 'owner', 'deductions']);

        $pdf = app('dompdf.wrapper')->loadView(
            'pdf.security-deposit',
            compact('securityDeposit')
        );

        return $pdf->download('Security-Deposit-' . $securityDeposit->tenant->name . '.pdf');
    }
}
