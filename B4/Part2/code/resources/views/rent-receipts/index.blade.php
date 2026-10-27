@extends('layouts.app')

@section('title', 'Rent Receipts')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Manage monthly rent receipts</p>
    <a href="{{ route('rent-receipts.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> New Rent Receipt
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
                    <th>Tenant</th>
                    <th>Owner</th>
                    <th>Amount (Rs.)</th>
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
                    <td>{{ $receipt->tenant->name ?? '—' }}</td>
                    <td>{{ $receipt->owner->name ?? '—' }}</td>
                    <td><strong>{{ number_format($receipt->amount) }}</strong></td>
                    <td>
                        <span class="badge badge-info">
                            {{ ucfirst(str_replace('_', ' ', $receipt->payment_method)) }}
                        </span>
                    </td>
                    <td>{{ $receipt->payment_date->format('d/m/Y') }}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('rent-receipts.show', $receipt) }}"
                                class="btn btn-sm btn-outline-primary" title="View">
                                <i class="bi bi-eye"></i>
                            </a>
                            <a href="{{ route('rent-receipts.edit', $receipt) }}"
                                class="btn btn-sm btn-outline-primary" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <a href="{{ route('rent-receipts.pdf', $receipt) }}"
                                class="btn btn-sm btn-outline-accent" title="Download PDF">
                                <i class="bi bi-file-pdf"></i>
                            </a>
                            <form action="{{ route('rent-receipts.destroy', $receipt) }}" method="POST"
                                onsubmit="return confirm('Delete this receipt?')">
                                @csrf
                                @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger" title="Delete">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        <i class="bi bi-receipt" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No rent receipts yet. Create your first one!</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $receipts->links() }}</div>
@endsection
