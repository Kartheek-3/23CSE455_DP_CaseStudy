@extends('layouts.app')

@section('title', 'Rent Receipt — ' . $rentReceipt->month)

@section('content')
<div class="mb-4 d-flex justify-content-between align-items-center">
    @if(auth()->user()->isTenant())
        <a href="{{ route('tenant.rent-receipts') }}" class="text-decoration-none small">
            <i class="bi bi-arrow-left me-1"></i> Back to My Rent Receipts
        </a>
        <a href="{{ route('tenant.rent-receipts.pdf', $rentReceipt) }}" class="btn btn-sm btn-primary">
            <i class="bi bi-file-pdf me-1"></i> Download PDF
        </a>
    @else
        <a href="{{ route('rent-receipts.index') }}" class="text-decoration-none small">
            <i class="bi bi-arrow-left me-1"></i> Back to Rent Receipts
        </a>
        <div class="d-flex gap-2 align-items-center">
            <a href="{{ route('rent-receipts.edit', $rentReceipt) }}" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil me-1"></i> Edit
            </a>
            <a href="{{ route('rent-receipts.pdf', $rentReceipt) }}" class="btn btn-sm btn-primary">
                <i class="bi bi-file-pdf me-1"></i> Download PDF
            </a>
        </div>
    @endif
</div>

{{-- Receipt Preview Card - matches your PDF style --}}
<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card" style="border: 2px solid #e2e8f0;">
            <div class="card-body p-4">

                {{-- Header --}}
                <div class="text-center mb-4">
                    <h3 style="color: #5b6abf; font-weight: 700;">RENT RECEIPT</h3>
                    <hr style="border-top: 3px solid #5b6abf; width: 100%;">
                </div>

                {{-- Property Info --}}
                <div class="p-3 mb-4" style="background: #f8f9fa; border-radius: .5rem;">
                    <p class="mb-1">
                        <span style="color: #5b6abf; font-weight: 600;">Property Address:</span>
                        {{ $rentReceipt->property->address }}
                    </p>
                    <p class="mb-0">
                        <span style="color: #5b6abf; font-weight: 600;">Month:</span>
                        {{ $rentReceipt->month }}
                    </p>
                </div>

                {{-- Amount Box --}}
                <div class="text-center p-3 mb-4" style="background: #f1f5f9; border-radius: .5rem;">
                    <div class="mb-1" style="font-size: .9rem; color: #64748b;">Rent Amount</div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: #1e293b;">
                        Rs. {{ number_format($rentReceipt->amount) }}/-
                    </div>
                    <div class="text-muted small">({{ $rentReceipt->amount_in_words }})</div>
                </div>

                {{-- Payment Details --}}
                <div class="row mb-4" style="font-size: .9rem;">
                    <div class="col-6">
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Tenant Name</span>
                            <strong>{{ $rentReceipt->tenant->name }}</strong>
                        </div>
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Payment Date</span>
                            <strong>{{ $rentReceipt->payment_date->format('d/m/Y') }}</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Owner Name</span>
                            <strong>{{ $rentReceipt->owner->name }}</strong>
                        </div>
                        <div class="py-2 border-bottom d-flex justify-content-between">
                            <span class="text-muted">Payment Method</span>
                            <strong>{{ ucfirst(str_replace('_', ' ', $rentReceipt->payment_method)) }}</strong>
                        </div>
                    </div>
                </div>

                {{-- Acknowledgment --}}
                <div class="p-3 mb-4" style="background: #fffde7; border-left: 4px solid #fdd835; border-radius: 0 .5rem .5rem 0;">
                    <p class="mb-0" style="font-size: .9rem; line-height: 1.7;">
                        This is to acknowledge that I, <strong>{{ $rentReceipt->owner->name }}</strong>,
                        have received a total sum of <strong>Rs. {{ number_format($rentReceipt->amount) }}/-</strong>
                        ({{ $rentReceipt->amount_in_words }}) from
                        <strong>Mr. {{ $rentReceipt->tenant->name }}</strong>, towards the rent of
                        {{ $rentReceipt->property->address }} for the month of
                        <strong>{{ $rentReceipt->month }}</strong>.
                    </p>
                </div>

                {{-- Notes --}}
                @if($rentReceipt->notes)
                <div class="p-3 mb-4" style="background: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 0 .5rem .5rem 0;">
                    <h6 class="mb-1"><i class="bi bi-sticky me-1"></i>Notes</h6>
                    <p class="mb-0" style="font-size: .875rem; color: #475569;">{{ $rentReceipt->notes }}</p>
                </div>
                @endif

                {{-- Received By --}}
                <div style="border-top: 2px dashed #cbd5e1; padding-top: 1.5rem;">
                    <h6 style="color: #5b6abf; font-weight: 600;">RECEIVED BY</h6>
                    <hr style="border-top: 1px solid #5b6abf;">
                    <div style="font-size: .9rem;">
                        <p class="mb-1"><strong>Name:</strong> {{ $rentReceipt->owner->name }}</p>
                        <p class="mb-1"><strong>Date:</strong> {{ $rentReceipt->payment_date->format('d/m/Y') }}</p>
                        <p class="mb-3"><strong>Contact:</strong> {{ $rentReceipt->owner->phone }}</p>
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
