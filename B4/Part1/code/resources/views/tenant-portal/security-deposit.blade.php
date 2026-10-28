@extends('layouts.app')

@section('title', 'My Security Deposit')

@section('content')
<div class="mb-4">
    <h4 class="mb-1">My Security Deposit</h4>
    <p class="text-muted small mb-0">Track your security deposit status</p>
</div>

@forelse($deposits as $deposit)
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-shield-lock me-2"></i>{{ $deposit->property->address }}</span>
        @if($deposit->status === 'held')
        <span class="badge badge-info">Held</span>
        @elseif($deposit->status === 'partially_refunded')
        <span class="badge badge-warning">Partially Refunded</span>
        @elseif($deposit->status === 'fully_refunded')
        <span class="badge badge-success">Fully Refunded</span>
        @else
        <span class="badge badge-danger">Forfeited</span>
        @endif
    </div>
    <div class="card-body" style="font-size: .875rem;">
        <div class="row">
            <div class="col-md-6">
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Deposit Amount</span>
                    <strong>Rs. {{ number_format($deposit->total_amount) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Security Months</span>
                    <strong>{{ $deposit->months_count }} months</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Rent at Time</span>
                    <strong>Rs. {{ number_format($deposit->monthly_rent_at_time) }}/month</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Deposit Date</span>
                    <strong>{{ $deposit->deposit_date->format('d M Y') }}</strong>
                </div>
            </div>
            <div class="col-md-6">
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span>Total Deposit</span>
                    <strong>Rs. {{ number_format($deposit->total_amount) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom" style="color: #991b1b;">
                    <span>Deductions</span>
                    <strong>- Rs. {{ number_format($deposit->total_deductions) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom" style="color: #166534;">
                    <span>Refunded</span>
                    <strong>- Rs. {{ number_format($deposit->refunded_amount) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 fs-5">
                    <strong>Balance</strong>
                    <strong style="color: #3730a3;">Rs. {{ number_format($deposit->balance) }}</strong>
                </div>
            </div>
        </div>

        {{-- Deductions --}}
        @if($deposit->deductions->count() > 0)
        <hr>
        <h6 class="mb-2">Deductions</h6>
        <table class="table table-sm mb-0">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Reason</th>
                    <th class="text-end">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($deposit->deductions as $d)
                <tr>
                    <td>{{ $d->deduction_date->format('d/m/Y') }}</td>
                    <td>{{ $d->reason }}</td>
                    <td class="text-end" style="color: #991b1b;">Rs. {{ number_format($d->amount) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>
</div>
@empty
<div class="card">
    <div class="card-body text-center py-5 text-muted">
        <i class="bi bi-shield-lock" style="font-size: 3rem; opacity: .3;"></i>
        <p class="mt-2">No security deposit records found.</p>
    </div>
</div>
@endforelse
@endsection
