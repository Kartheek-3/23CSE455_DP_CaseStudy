@extends('layouts.app')

@section('title', 'My Rent Receipts')

@section('content')
<div class="mb-4">
    <h4 class="mb-1">My Rent Receipts</h4>
    <p class="text-muted small mb-0">All your rent payment records</p>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Property</th>
                    <th>Amount</th>
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
                    <td>{{ Str::limit($receipt->property->address ?? '—', 30) }}</td>
                    <td><strong>Rs. {{ number_format($receipt->amount) }}</strong></td>
                    <td><span class="badge badge-info">{{ ucfirst(str_replace('_', ' ', $receipt->payment_method)) }}</span></td>
                    <td>{{ $receipt->payment_date->format('d/m/Y') }}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('tenant.rent-receipts.show', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('tenant.rent-receipts.pdf', $receipt) }}" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i></a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">No rent receipts found.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
<div class="mt-3">{{ $receipts->links() }}</div>
@endsection
