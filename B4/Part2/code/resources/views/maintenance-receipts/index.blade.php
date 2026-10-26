@extends('layouts.app')

@section('title', 'Maintenance Receipts')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Manage monthly maintenance bill receipts</p>
    <a href="{{ route('maintenance-receipts.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> New Maintenance Receipt
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Property</th>
                    <th>Total (Rs.)</th>
                    <th>Owner Share</th>
                    <th>Tenant Share</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($receipts as $receipt)
                <tr>
                    <td>{{ $loop->iteration + ($receipts->currentPage() - 1) * $receipts->perPage() }}</td>
                    <td><strong>{{ $receipt->month }}</strong></td>
                    <td>{{ Str::limit($receipt->property->address ?? '—', 25) }}</td>
                    <td><strong>{{ number_format($receipt->total_maintenance) }}</strong></td>
                    <td>{{ number_format($receipt->owner_share) }} ({{ $receipt->owner_percent }}%)</td>
                    <td>{{ number_format($receipt->tenant_share) }} ({{ $receipt->tenant_percent }}%)</td>
                    <td><span class="badge badge-info">{{ ucfirst(str_replace('_', ' ', $receipt->payment_method)) }}</span></td>
                    <td>{{ $receipt->payment_date->format('d/m/Y') }}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('maintenance-receipts.show', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('maintenance-receipts.edit', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                            <a href="{{ route('maintenance-receipts.pdf', $receipt) }}" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i></a>
                            <form action="{{ route('maintenance-receipts.destroy', $receipt) }}" method="POST"
                                onsubmit="return confirm('Delete this receipt?')">
                                @csrf
                                @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        <i class="bi bi-tools" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No maintenance receipts yet.</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $receipts->links() }}</div>
@endsection
