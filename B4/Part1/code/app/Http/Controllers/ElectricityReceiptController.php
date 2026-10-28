<?php

namespace App\Http\Controllers;

use App\Models\ElectricityReceipt;
use App\Models\Property;
use App\Http\Requests\StoreElectricityReceiptRequest;
use App\Http\Requests\UpdateElectricityReceiptRequest;

class ElectricityReceiptController extends Controller
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
        $query = ElectricityReceipt::with(['property', 'tenant', 'owner']);

        if (auth()->user()->isOwner() && auth()->user()->owner) {
            $query->where('owner_id', auth()->user()->owner->id);
        }

        $receipts = $query->latest()->paginate(15);

        return view('electricity-receipts.index', compact('receipts'));
    }

    public function create()
    {
        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        // Get last electricity receipt for each property (for previous readings)
        $lastReadings = [];
        foreach ($properties as $property) {
            $last = ElectricityReceipt::where('property_id', $property->id)
                ->latest()
                ->first();
            if ($last) {
                $lastReadings[$property->id] = [
                    'main_current' => $last->main_current_reading,
                    'main_date' => $last->main_current_date->format('Y-m-d'),
                    'sub_current' => $last->sub_current_reading,
                ];
            }
        }

        return view('electricity-receipts.create', compact('properties', 'lastReadings'));
    }

    public function store(StoreElectricityReceiptRequest $request)
    {
        $property = Property::with(['owner', 'tenant'])->findOrFail($request->property_id);

        $data = [
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'month' => $request->month,
            'main_previous_reading' => $request->main_previous_reading,
            'main_current_reading' => $request->main_current_reading,
            'main_previous_date' => $request->main_previous_date,
            'main_current_date' => $request->main_current_date,
            'sub_previous_reading' => $request->sub_previous_reading,
            'sub_current_reading' => $request->sub_current_reading,
            'rate_per_unit' => $request->rate_per_unit,
            'main_bill_amount' => $request->main_bill_amount,
            'tenant_amount_in_words' => $request->tenant_amount_in_words,
            'payment_method' => $request->payment_method,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
            'bill_reference' => $request->bill_reference,
        ];

        // Handle file upload
        if ($request->hasFile('bill_attachment')) {
            $data['bill_attachment'] = $request->file('bill_attachment')
                ->store('bill-attachments/electricity', 'public');
        }

        if ($request->hasFile('submeter_previous_photo')) {
            $data['submeter_previous_photo'] = $request->file('submeter_previous_photo')
                ->store('submeter-photos', 'public');
        }

        if ($request->hasFile('submeter_current_photo')) {
            $data['submeter_current_photo'] = $request->file('submeter_current_photo')
                ->store('submeter-photos', 'public');
        }

        ElectricityReceipt::create($data);

        return redirect()->route('electricity-receipts.index')
            ->with('success', 'Electricity receipt created successfully.');
    }

    public function show(ElectricityReceipt $electricityReceipt)
    {
        $this->authorizeOwnerAccess($electricityReceipt);

        $electricityReceipt->load(['property', 'tenant', 'owner']);
        return view('electricity-receipts.show', compact('electricityReceipt'));
    }

    public function edit(ElectricityReceipt $electricityReceipt)
    {
        $this->authorizeOwnerAccess($electricityReceipt);

        $properties = Property::with(['owner', 'tenant'])
            ->where('status', 'occupied')
            ->get();

        return view('electricity-receipts.edit', compact('electricityReceipt', 'properties'));
    }

    public function update(UpdateElectricityReceiptRequest $request, ElectricityReceipt $electricityReceipt)
    {
        $this->authorizeOwnerAccess($electricityReceipt);

        $property = Property::findOrFail($request->property_id);

        $data = [
            'property_id' => $property->id,
            'tenant_id' => $property->tenant_id,
            'owner_id' => $property->owner_id,
            'month' => $request->month,
            'main_previous_reading' => $request->main_previous_reading,
            'main_current_reading' => $request->main_current_reading,
            'main_previous_date' => $request->main_previous_date,
            'main_current_date' => $request->main_current_date,
            'sub_previous_reading' => $request->sub_previous_reading,
            'sub_current_reading' => $request->sub_current_reading,
            'rate_per_unit' => $request->rate_per_unit,
            'main_bill_amount' => $request->main_bill_amount,
            'tenant_amount_in_words' => $request->tenant_amount_in_words,
            'payment_method' => $request->payment_method,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
            'bill_reference' => $request->bill_reference,
        ];

        if ($request->hasFile('bill_attachment')) {
            // Delete old file if exists
            if ($electricityReceipt->bill_attachment) {
                \Storage::disk('public')->delete($electricityReceipt->bill_attachment);
            }
            $data['bill_attachment'] = $request->file('bill_attachment')
                ->store('bill-attachments/electricity', 'public');
        }

        if ($request->hasFile('submeter_previous_photo')) {
            if ($electricityReceipt->submeter_previous_photo) {
                \Storage::disk('public')->delete($electricityReceipt->submeter_previous_photo);
            }
            $data['submeter_previous_photo'] = $request->file('submeter_previous_photo')
                ->store('submeter-photos', 'public');
        }

        if ($request->hasFile('submeter_current_photo')) {
            if ($electricityReceipt->submeter_current_photo) {
                \Storage::disk('public')->delete($electricityReceipt->submeter_current_photo);
            }
            $data['submeter_current_photo'] = $request->file('submeter_current_photo')
                ->store('submeter-photos', 'public');
        }

        $electricityReceipt->update($data);

        return redirect()->route('electricity-receipts.index')
            ->with('success', 'Electricity receipt updated successfully.');
    }

    public function destroy(ElectricityReceipt $electricityReceipt)
    {
        $this->authorizeOwnerAccess($electricityReceipt);

        $electricityReceipt->delete();

        return redirect()->route('electricity-receipts.index')
            ->with('success', 'Electricity receipt deleted successfully.');
    }

    public function downloadPdf(ElectricityReceipt $electricityReceipt)
    {
        $this->authorizeOwnerAccess($electricityReceipt);

        $electricityReceipt->load(['property', 'tenant', 'owner']);

        $pdf = app('dompdf.wrapper')->loadView(
            'pdf.electricity-receipt',
            compact('electricityReceipt')
        );

        $filename = 'Bill-Receipt-' . str_replace(' ', '-', $electricityReceipt->month) . '.pdf';

        return $pdf->download($filename);
    }
}
