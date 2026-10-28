@extends('layouts.app')

@section('title', 'Electricity Receipt — ' . $electricityReceipt->month)

@section('content')
<div class="mb-4 d-flex justify-content-between align-items-center">
    @if(auth()->user()->isTenant())
    <a href="{{ route('tenant.electricity-receipts') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to My Electricity Bills
    </a>
    <a href="{{ route('tenant.electricity-receipts.pdf', $electricityReceipt) }}" class="btn btn-sm btn-primary">
        <i class="bi bi-file-pdf me-1"></i> Download PDF
    </a>
    @else
    <a href="{{ route('electricity-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Electricity Receipts
    </a>
    <div class="d-flex gap-2 align-items-center">
        <a href="{{ route('electricity-receipts.edit', $electricityReceipt) }}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-pencil me-1"></i> Edit
        </a>
        <a href="{{ route('electricity-receipts.pdf', $electricityReceipt) }}" class="btn btn-sm btn-primary">
            <i class="bi bi-file-pdf me-1"></i> Download PDF
        </a>
    </div>
    @endif
</div>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card" style="border: 2px solid #e2e8f0;">
            <div class="card-body p-4">

                <div class="text-center mb-4">
                    <h3 style="color: #5b6abf; font-weight: 700;">BILL RECEIPT</h3>
                    <hr style="border-top: 3px solid #5b6abf;">
                </div>

                <div class="p-3 mb-4" style="background: #f8f9fa; border-radius: .5rem;">
                    <p class="mb-1"><span style="color: #5b6abf; font-weight: 600;">Property Address:</span> {{ $electricityReceipt->property->address }}</p>
                    <p class="mb-0"><span style="color: #5b6abf; font-weight: 600;">Billing Period:</span> {{ $electricityReceipt->month }}</p>
                </div>

                {{-- Meter Readings --}}
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="p-3 rounded" style="background: #f8fafc; border-left: 4px solid #5b6abf;">
                            <h6 style="color: #5b6abf;">Main Meter Reading</h6>
                            <div style="font-size: .875rem;">
                                <p class="mb-1">Previous Reading: <strong>{{ number_format($electricityReceipt->main_previous_reading) }} Units</strong> ({{ $electricityReceipt->main_previous_date->format('d M Y') }})</p>
                                <p class="mb-1">Current Reading: <strong>{{ number_format($electricityReceipt->main_current_reading) }} Units</strong> ({{ $electricityReceipt->main_current_date->format('d M Y') }})</p>
                                <p class="mb-0"><strong>Total Units Consumed: {{ $electricityReceipt->main_total_units }} Units</strong></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded" style="background: #fefce8; border-left: 4px solid #eab308;">
                            <h6 style="color: #92400e;">Tenant Sub-Meter Reading</h6>
                            <div style="font-size: .875rem;">
                                <p class="mb-1">Previous Reading: <strong>{{ number_format($electricityReceipt->sub_previous_reading) }} Units</strong> ({{ $electricityReceipt->main_previous_date->format('d M Y') }})</p>
                                <p class="mb-1">Current Reading: <strong>{{ number_format($electricityReceipt->sub_current_reading) }} Units</strong> ({{ $electricityReceipt->main_current_date->format('d M Y') }})</p>
                                <p class="mb-0"><strong>Tenant Units Consumed: {{ $electricityReceipt->tenant_units_consumed }} Units</strong></p>
                            </div>
                            {{-- Sub-Meter Photos --}}
                            @if($electricityReceipt->submeter_previous_photo || $electricityReceipt->submeter_current_photo)
                            <div class="row mb-4">
                                @if($electricityReceipt->submeter_previous_photo)
                                <div class="col-md-6">
                                    <div class="p-3 rounded" style="border: 1px solid #e2e8f0;">
                                        <h6 class="mb-2" style="font-size: .85rem;"><i class="bi bi-camera me-1"></i>Previous Reading Photo</h6>
                                        <a href="{{ asset('storage/' . $electricityReceipt->submeter_previous_photo) }}" target="_blank">
                                            <img src="{{ asset('storage/' . $electricityReceipt->submeter_previous_photo) }}"
                                                style="max-width: 100%; border-radius: .5rem; border: 2px solid #e2e8f0;">
                                        </a>
                                        <small class="text-muted d-block mt-1">Reading: {{ number_format($electricityReceipt->sub_previous_reading) }} Units</small>
                                    </div>
                                </div>
                                @endif
                                @if($electricityReceipt->submeter_current_photo)
                                <div class="col-md-6">
                                    <div class="p-3 rounded" style="border: 1px solid #e2e8f0;">
                                        <h6 class="mb-2" style="font-size: .85rem;"><i class="bi bi-camera me-1"></i>Current Reading Photo</h6>
                                        <a href="{{ asset('storage/' . $electricityReceipt->submeter_current_photo) }}" target="_blank">
                                            <img src="{{ asset('storage/' . $electricityReceipt->submeter_current_photo) }}"
                                                style="max-width: 100%; border-radius: .5rem; border: 2px solid #e2e8f0;">
                                        </a>
                                        <small class="text-muted d-block mt-1">Reading: {{ number_format($electricityReceipt->sub_current_reading) }} Units</small>
                                    </div>
                                </div>
                                @endif
                            </div>
                            @endif
                        </div>
                    </div>
                </div>

                {{-- Billing Table --}}
                <table class="table table-bordered mb-4" style="font-size: .9rem;">
                    <thead style="background: #5b6abf; color: #fff;">
                        <tr>
                            <th>Description</th>
                            <th>Calculation</th>
                            <th>Rate (Rs.)</th>
                            <th class="text-end">Amount (Rs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tenant Electricity (Sub-meter)</td>
                            <td>{{ $electricityReceipt->tenant_units_consumed }} units × {{ $electricityReceipt->rate_per_unit }}</td>
                            <td>{{ $electricityReceipt->rate_per_unit }}/unit</td>
                            <td class="text-end">{{ number_format($electricityReceipt->tenant_bill) }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: 700;">
                            <td colspan="3">Total Tenant Bill</td>
                            <td class="text-end" style="color: #991b1b;">Rs. {{ number_format($electricityReceipt->tenant_bill) }}/-</td>
                        </tr>
                    </tfoot>
                </table>

                {{-- Cost Distribution --}}
                <div class="p-3 mb-4" style="background: #fefce8; border-left: 4px solid #eab308; border-radius: 0 .5rem .5rem 0; font-size: .875rem;">
                    <strong>Cost Distribution Analysis</strong>
                    <p class="mb-1 mt-2">Owner Consumption: {{ $electricityReceipt->owner_units_consumed }} units × {{ $electricityReceipt->rate_per_unit }} = Rs. {{ number_format($electricityReceipt->owner_bill) }}/-</p>
                    <p class="mb-1">Tenant Consumption: {{ $electricityReceipt->tenant_units_consumed }} units × {{ $electricityReceipt->rate_per_unit }} = Rs. {{ number_format($electricityReceipt->tenant_bill) }}/-</p>
                    <p class="mb-1">Main Bill Amount: Rs. {{ number_format($electricityReceipt->main_bill_amount) }}/-</p>
                    <p class="mb-0">Difference: Rs. {{ number_format($electricityReceipt->main_bill_amount) }} - Rs. {{ number_format($electricityReceipt->tenant_bill) }} = Rs. {{ number_format($electricityReceipt->main_bill_amount - $electricityReceipt->tenant_bill) }}/-</p>
                </div>

                {{-- Payment Details --}}
                <div class="row mb-4" style="font-size: .9rem;">
                    <div class="col-6">
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Tenant Name</span>
                            <strong>{{ $electricityReceipt->tenant->name }}</strong>
                        </div>
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Payment Date</span>
                            <strong>{{ $electricityReceipt->payment_date->format('d/m/Y') }}</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Owner Name</span>
                            <strong>{{ $electricityReceipt->owner->name }}</strong>
                        </div>
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Payment Method</span>
                            <strong>{{ ucfirst(str_replace('_', ' ', $electricityReceipt->payment_method)) }}</strong>
                        </div>
                    </div>
                </div>

                {{-- Acknowledgment --}}
                <div class="p-3 mb-4" style="background: #f0fdf4; border-left: 4px solid #16A34A; border-radius: 0 .5rem .5rem 0;">
                    <p class="mb-0" style="font-size: .9rem; line-height: 1.7;">
                        This is to acknowledge that I, <strong>{{ $electricityReceipt->owner->name }}</strong>,
                        have received a total sum of <strong>Rs. {{ number_format($electricityReceipt->tenant_bill) }}/-</strong>
                        ({{ $electricityReceipt->tenant_amount_in_words }}) from <strong>Mr. {{ $electricityReceipt->tenant->name }}</strong>,
                        towards the electricity bill of {{ $electricityReceipt->property->address }}
                        for the month of <strong>{{ $electricityReceipt->month }}</strong>.
                    </p>
                </div>

                {{-- Notes --}}
                @if($electricityReceipt->notes)
                <div class="p-3 mb-4" style="background: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 0 .5rem .5rem 0;">
                    <h6 class="mb-1"><i class="bi bi-sticky me-1"></i>Notes</h6>
                    <p class="mb-0" style="font-size: .875rem; color: #475569;">{{ $electricityReceipt->notes }}</p>
                </div>
                @endif

                {{-- Bill Copy --}}
                @if($electricityReceipt->bill_reference || $electricityReceipt->bill_attachment)
                <div class="p-3 mb-4" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: .5rem;">
                    <h6 class="mb-2"><i class="bi bi-paperclip me-1"></i>Original Bill Copy</h6>
                    <div style="font-size: .875rem;">
                        @if($electricityReceipt->bill_reference)
                        <p class="mb-1"><strong>Reference:</strong> {{ $electricityReceipt->bill_reference }}</p>
                        @endif
                        @if($electricityReceipt->bill_attachment)
                        <a href="{{ asset('storage/' . $electricityReceipt->bill_attachment) }}"
                            target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-file-earmark me-1"></i>View Attached Bill
                        </a>
                        @endif
                    </div>
                </div>
                @endif

                {{-- Received By --}}
                <div style="border-top: 2px dashed #cbd5e1; padding-top: 1.5rem;">
                    <h6 style="color: #5b6abf; font-weight: 600;">RECEIVED BY</h6>
                    <hr style="border-top: 1px solid #5b6abf;">
                    <div style="font-size: .9rem;">
                        <p class="mb-1"><strong>Name:</strong> {{ $electricityReceipt->owner->name }}</p>
                        <p class="mb-1"><strong>Date:</strong> {{ $electricityReceipt->payment_date->format('d/m/Y') }}</p>
                        <p class="mb-3"><strong>Contact:</strong> {{ $electricityReceipt->owner->phone }}</p>
                        <p class="mb-0">________________________</p>
                        <p class="text-muted small">Signature</p>
                    </div>
                </div>

                <div class="text-center mt-4">
                    <em class="text-muted small">This is a computer-generated receipt for record purposes.</em>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
