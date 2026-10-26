@extends('layouts.app')

@section('title', 'My Electricity Bills')

@section('content')
<div class="mb-4">
    <h4 class="mb-1">My Electricity Bill Receipts</h4>
    <p class="text-muted small mb-0">All your electricity payment records</p>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Units</th>
                    <th>Rate/Unit</th>
                    <th>Your Bill</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($receipts as $receipt)
                <tr>
                    <td>{{ $loop->iteration + ($receipts->currentPage() - 1) * $receipts->perPage() }}</td>
                    <td><strong>{{ $receipt->month }}</strong></td>
                    <td>{{ $receipt->tenant_units_consumed }} units</td>
                    <td>Rs. {{ $receipt->rate_per_unit }}</td>
                    <td><strong>Rs. {{ number_format($receipt->tenant_bill) }}</strong></td>
                    <td>{{ $receipt->payment_date->format('d/m/Y') }}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('tenant.electricity-receipts.show', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('tenant.electricity-receipts.pdf', $receipt) }}" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i></a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">No electricity receipts found.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
<div class="mt-3">{{ $receipts->links() }}</div>
@endsection
