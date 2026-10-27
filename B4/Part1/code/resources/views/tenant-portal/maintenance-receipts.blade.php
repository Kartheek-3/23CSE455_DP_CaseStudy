@extends('layouts.app')

@section('title', 'My Maintenance Bills')

@section('content')
<div class="mb-4">
    <h4 class="mb-1">My Maintenance Bill Receipts</h4>
    <p class="text-muted small mb-0">All your maintenance payment records</p>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Total Bill</th>
                    <th>Your Share</th>
                    <th>Split</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($receipts as $receipt)
                <tr>
                    <td>{{ $loop->iteration + ($receipts->currentPage() - 1) * $receipts->perPage() }}</td>
                    <td><strong>{{ $receipt->month }}</strong></td>
                    <td>Rs. {{ number_format($receipt->total_maintenance) }}</td>
                    <td><strong>Rs. {{ number_format($receipt->tenant_share) }}</strong></td>
                    <td>{{ $receipt->tenant_percent }}%</td>
                    <td>{{ $receipt->payment_date->format('d/m/Y') }}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('tenant.maintenance-receipts.show', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('tenant.maintenance-receipts.pdf', $receipt) }}" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i></a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">No maintenance receipts found.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
<div class="mt-3">{{ $receipts->links() }}</div>
@endsection
