@extends('layouts.app')

@section('title', 'Maintenance Receipt — ' . $maintenanceReceipt->month)

@section('content')
<div class="mb-4 d-flex justify-content-between align-items-center">
    @if(auth()->user()->isTenant())
    <a href="{{ route('tenant.maintenance-receipts') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to My Maintenance Bills
    </a>
    <a href="{{ route('tenant.maintenance-receipts.pdf', $maintenanceReceipt) }}" class="btn btn-sm btn-primary">
        <i class="bi bi-file-pdf me-1"></i> Download PDF
    </a>
    @else
    <a href="{{ route('maintenance-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Maintenance Receipts
    </a>
    <div class="d-flex gap-2 align-items-center">
        <a href="{{ route('maintenance-receipts.edit', $maintenanceReceipt) }}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-pencil me-1"></i> Edit
        </a>
        <a href="{{ route('maintenance-receipts.pdf', $maintenanceReceipt) }}" class="btn btn-sm btn-primary">
            <i class="bi bi-file-pdf me-1"></i> Download PDF
        </a>
    </div>
    @endif
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card" style="border: 2px solid #e2e8f0;">
            <div class="card-body p-4">

                <div class="text-center mb-4">
                    <h3 style="color: #5b6abf; font-weight: 700;">MAINTENANCE BILL RECEIPT</h3>
                    <hr style="border-top: 3px solid #5b6abf;">
                </div>

                <div class="p-3 mb-4" style="background: #f8f9fa; border-radius: .5rem;">
                    <p class="mb-1"><span style="color: #5b6abf; font-weight: 600;">Property Address:</span> {{ $maintenanceReceipt->property->address }}</p>
                    <p class="mb-0"><span style="color: #5b6abf; font-weight: 600;">Billing Period:</span> {{ $maintenanceReceipt->month }}</p>
                </div>

                {{-- Breakdown Table --}}
                <table class="table table-bordered mb-4" style="font-size: .9rem;">
                    <thead style="background: #5b6abf; color: #fff;">
                        <tr>
                            <th>Description</th>
                            <th>Details</th>
                            <th class="text-end">Amount (Rs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Maintenance Bill</td>
                            <td>For {{ $maintenanceReceipt->month }}</td>
                            <td class="text-end">{{ number_format($maintenanceReceipt->total_maintenance) }}</td>
                        </tr>
                        <tr>
                            <td>Owner's Share ({{ $maintenanceReceipt->owner_percent }}%)</td>
                            <td>{{ number_format($maintenanceReceipt->total_maintenance) }} ÷ {{ 100 / $maintenanceReceipt->owner_percent }}</td>
                            <td class="text-end">{{ number_format($maintenanceReceipt->owner_share) }}</td>
                        </tr>
                        <tr>
                            <td>Tenant's Share ({{ $maintenanceReceipt->tenant_percent }}%)</td>
                            <td>{{ number_format($maintenanceReceipt->total_maintenance) }} ÷ {{ 100 / $maintenanceReceipt->tenant_percent }}</td>
                            <td class="text-end">{{ number_format($maintenanceReceipt->tenant_share) }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: 700;">
                            <td colspan="2">Tenant Payable Amount</td>
                            <td class="text-end" style="color: #991b1b;">Rs. {{ number_format($maintenanceReceipt->tenant_share) }}/-</td>
                        </tr>
                    </tfoot>
                </table>

                {{-- Cost Distribution Summary --}}
                <div class="p-3 mb-4" style="background: #fefce8; border-left: 4px solid #eab308; border-radius: 0 .5rem .5rem 0; font-size: .875rem;">
                    <strong>Cost Distribution Summary</strong>
                    <p class="mb-1 mt-2">Total Monthly Maintenance: Rs. {{ number_format($maintenanceReceipt->total_maintenance) }}/-</p>
                    <p class="mb-1">Owner's Contribution: Rs. {{ number_format($maintenanceReceipt->owner_share) }}/- ({{ $maintenanceReceipt->owner_percent }}%)</p>
                    <p class="mb-0">Tenant's Contribution: Rs. {{ number_format($maintenanceReceipt->tenant_share) }}/- ({{ $maintenanceReceipt->tenant_percent }}%)</p>
                </div>

                {{-- Payment Details --}}
                <div class="row mb-4" style="font-size: .9rem;">
                    <div class="col-6">
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Tenant Name</span>
                            <strong>{{ $maintenanceReceipt->tenant->name }}</strong>
                        </div>
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Payment Date</span>
                            <strong>{{ $maintenanceReceipt->payment_date->format('d/m/Y') }}</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Owner Name</span>
                            <strong>{{ $maintenanceReceipt->owner->name }}</strong>
                        </div>
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Payment Method</span>
                            <strong>{{ ucfirst(str_replace('_', ' ', $maintenanceReceipt->payment_method)) }}</strong>
                        </div>
                    </div>
                </div>

                {{-- Acknowledgment --}}
                <div class="p-3 mb-4" style="background: #f0fdf4; border-left: 4px solid #16A34A; border-radius: 0 .5rem .5rem 0;">
                    <p class="mb-0" style="font-size: .9rem; line-height: 1.7;">
                        This is to acknowledge that I, <strong>{{ $maintenanceReceipt->owner->name }}</strong>,
                        have received a total sum of <strong>Rs. {{ number_format($maintenanceReceipt->tenant_share) }}/-</strong>
                        ({{ $maintenanceReceipt->tenant_amount_in_words }}) from <strong>Mr. {{ $maintenanceReceipt->tenant->name }}</strong>,
                        towards the maintenance charges of {{ $maintenanceReceipt->property->address }}
                        for the month of <strong>{{ $maintenanceReceipt->month }}</strong>.
                    </p>
                </div>

                {{-- Notes --}}
                @if($maintenanceReceipt->notes)
                <div class="p-3 mb-4" style="background: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 0 .5rem .5rem 0;">
                    <h6 class="mb-1"><i class="bi bi-sticky me-1"></i>Notes</h6>
                    <p class="mb-0" style="font-size: .875rem; color: #475569;">{{ $maintenanceReceipt->notes }}</p>
                </div>
                @endif

                {{-- Bill Copy --}}
                @if($maintenanceReceipt->bill_reference || $maintenanceReceipt->bill_attachment)
                <div class="p-3 mb-4" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: .5rem;">
                    <h6 class="mb-2"><i class="bi bi-paperclip me-1"></i>Original Bill Copy</h6>
                    <div style="font-size: .875rem;">
                        @if($maintenanceReceipt->bill_reference)
                        <p class="mb-1"><strong>Reference:</strong> {{ $maintenanceReceipt->bill_reference }}</p>
                        @endif
                        @if($maintenanceReceipt->bill_attachment)
                        <a href="{{ asset('storage/' . $maintenanceReceipt->bill_attachment) }}"
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
                        <p class="mb-1"><strong>Name:</strong> {{ $maintenanceReceipt->owner->name }}</p>
                        <p class="mb-1"><strong>Date:</strong> {{ $maintenanceReceipt->payment_date->format('d/m/Y') }}</p>
                        <p class="mb-3"><strong>Contact:</strong> {{ $maintenanceReceipt->owner->phone }}</p>
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
