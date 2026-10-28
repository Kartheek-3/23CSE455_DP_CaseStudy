<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceReceipt;
use App\Models\Property;
use App\Http\Requests\StoreMaintenanceReceiptRequest;
use App\Http\Requests\UpdateMaintenanceReceiptRequest;

class MaintenanceReceiptController extends Controller
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
        $query = MaintenanceReceipt::with(['property', 'tenant', 'owner']);

        if (auth()->user()->isOwner() && auth()->user()->owner) {
            $query->where('owner_id', auth()->user()->owner->id);
        }

        $receipts = $query->latest()->paginate(15);

        return view('maintenance-receipts.index', compact('receipts'));
    }

    public function create()
    {
        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('maintenance-receipts.create', compact('properties'));
    }

    public function store(StoreMaintenanceReceiptRequest $request)
    {
        $property = Property::with(['owner', 'tenant'])->findOrFail($request->property_id);

        $data = [
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'month' => $request->month,
            'total_maintenance' => $request->total_maintenance,
            'owner_percent' => $request->owner_percent,
            'tenant_percent' => $request->tenant_percent,
            'tenant_amount_in_words' => $request->tenant_amount_in_words,
            'payment_method' => $request->payment_method,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
            'bill_reference' => $request->bill_reference,
        ];

        if ($request->hasFile('bill_attachment')) {
            $data['bill_attachment'] = $request->file('bill_attachment')
                ->store('bill-attachments/maintenance', 'public');
        }

        MaintenanceReceipt::create($data);

        return redirect()->route('maintenance-receipts.index')
            ->with('success', 'Maintenance receipt created successfully.');
    }

    public function show(MaintenanceReceipt $maintenanceReceipt)
    {
        $this->authorizeOwnerAccess($maintenanceReceipt);

        $maintenanceReceipt->load(['property', 'tenant', 'owner']);
        return view('maintenance-receipts.show', compact('maintenanceReceipt'));
    }

    public function edit(MaintenanceReceipt $maintenanceReceipt)
    {
        $this->authorizeOwnerAccess($maintenanceReceipt);

        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('maintenance-receipts.edit', compact('maintenanceReceipt', 'properties'));
    }

    public function update(UpdateMaintenanceReceiptRequest $request, MaintenanceReceipt $maintenanceReceipt)
    {
        $this->authorizeOwnerAccess($maintenanceReceipt);

        $property = Property::findOrFail($request->property_id);

        $data = [
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'month' => $request->month,
            'total_maintenance' => $request->total_maintenance,
            'owner_percent' => $request->owner_percent,
            'tenant_percent' => $request->tenant_percent,
            'tenant_amount_in_words' => $request->tenant_amount_in_words,
            'payment_method' => $request->payment_method,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
            'bill_reference' => $request->bill_reference,
        ];

        if ($request->hasFile('bill_attachment')) {
            if ($maintenanceReceipt->bill_attachment) {
                \Storage::disk('public')->delete($maintenanceReceipt->bill_attachment);
            }
            $data['bill_attachment'] = $request->file('bill_attachment')
                ->store('bill-attachments/maintenance', 'public');
        }

        $maintenanceReceipt->update($data);

        return redirect()->route('maintenance-receipts.index')
            ->with('success', 'Maintenance receipt updated successfully.');
    }

    public function destroy(MaintenanceReceipt $maintenanceReceipt)
    {
        $this->authorizeOwnerAccess($maintenanceReceipt);

        $maintenanceReceipt->delete();

        return redirect()->route('maintenance-receipts.index')
            ->with('success', 'Maintenance receipt deleted successfully.');
    }

    public function downloadPdf(MaintenanceReceipt $maintenanceReceipt)
    {
        $this->authorizeOwnerAccess($maintenanceReceipt);

        $maintenanceReceipt->load(['property', 'tenant', 'owner']);

        $pdf = app('dompdf.wrapper')->loadView(
            'pdf.maintenance-receipt',
            compact('maintenanceReceipt')
        );

        $filename = 'Maintenance-Bill-Receipt-' . str_replace(' ', '-', $maintenanceReceipt->month) . '.pdf';

        return $pdf->download($filename);
    }
}
