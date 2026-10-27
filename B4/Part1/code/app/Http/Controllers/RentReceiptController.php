<?php

namespace App\Http\Controllers;

use App\Models\RentReceipt;
use App\Models\Property;
use App\Http\Requests\StoreRentReceiptRequest;
use App\Http\Requests\UpdateRentReceiptRequest;

class RentReceiptController extends Controller
{
    private function authorizeOwnerAccess($receipt)
    {
        $user = auth()->user();
        if ($user->isOwner() && $user->owner) {
            abort_if($receipt->owner_id !== $user->owner->id, 403);
        }
    }

    public function index()
    {
        $query = RentReceipt::with(['property', 'tenant', 'owner']);

        if (auth()->user()->isOwner() && auth()->user()->owner) {
            $query->where('owner_id', auth()->user()->owner->id);
        }

        $receipts = $query->latest()->paginate(15);

        return view('rent-receipts.index', compact('receipts'));
    }

    public function create()
    {
        // Only show occupied properties (they have tenants)
        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('rent-receipts.create', compact('properties'));
    }

    public function store(StoreRentReceiptRequest $request)
    {
        $property = Property::with(['owner', 'tenant'])->findOrFail($request->property_id);

        RentReceipt::create([
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'month' => $request->month,
            'amount' => $request->amount,
            'amount_in_words' => $request->amount_in_words,
            'payment_method' => $request->payment_method,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('rent-receipts.index')
            ->with('success', 'Rent receipt created successfully.');
    }

    public function show(RentReceipt $rentReceipt)
    {
        $this->authorizeOwnerAccess($rentReceipt);

        $rentReceipt->load(['property', 'tenant', 'owner']);
        return view('rent-receipts.show', compact('rentReceipt'));
    }

    public function edit(RentReceipt $rentReceipt)
    {
        $this->authorizeOwnerAccess($rentReceipt);

        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('rent-receipts.edit', compact('rentReceipt', 'properties'));
    }

    public function update(UpdateRentReceiptRequest $request, RentReceipt $rentReceipt)
    {
        $this->authorizeOwnerAccess($rentReceipt);

        $property = Property::findOrFail($request->property_id);

        $rentReceipt->update([
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'month' => $request->month,
            'amount' => $request->amount,
            'amount_in_words' => $request->amount_in_words,
            'payment_method' => $request->payment_method,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('rent-receipts.index')
            ->with('success', 'Rent receipt updated successfully.');
    }

    public function destroy(RentReceipt $rentReceipt)
    {
        $this->authorizeOwnerAccess($rentReceipt);

        $rentReceipt->delete();

        return redirect()->route('rent-receipts.index')
            ->with('success', 'Rent receipt deleted successfully.');
    }

    // ── PDF Download ─────────────────────────────
    // We'll implement this after installing DomPDF
    public function downloadPdf(RentReceipt $rentReceipt)
    {
        $this->authorizeOwnerAccess($rentReceipt);

        $rentReceipt->load(['property', 'tenant', 'owner']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView(
            'pdf.rent-receipt',
            compact('rentReceipt')
        );

        $filename = 'Rent-Receipt-' . str_replace(' ', '-', $rentReceipt->month) . '.pdf';

        return $pdf->download($filename);
    }
}
