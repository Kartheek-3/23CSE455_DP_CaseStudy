@extends('layouts.app')

@section('title', 'Electricity Bill Receipts')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Manage electricity bill receipts with meter readings</p>
    <a href="{{ route('electricity-receipts.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> New Electricity Receipt
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
                    <th>Tenant Units</th>
                    <th>Rate/Unit</th>
                    <th>Tenant Bill</th>
                    <th>Main Bill</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($receipts as $receipt)
                <tr>
                    <td>{{ $loop->iteration + ($receipts->currentPage() - 1) * $receipts->perPage() }}</td>
                    <td><strong>{{ $receipt->month }}</strong></td>
                    <td>{{ Str::limit($receipt->property->address ?? '—', 20) }}</td>
                    <td>{{ $receipt->tenant_units_consumed }} units</td>
                    <td>Rs. {{ $receipt->rate_per_unit }}</td>
                    <td><strong>Rs. {{ number_format($receipt->tenant_bill) }}</strong></td>
                    <td>Rs. {{ number_format($receipt->main_bill_amount) }}</td>
                    <td>{{ $receipt->payment_date->format('d/m/Y') }}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('electricity-receipts.show', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('electricity-receipts.edit', $receipt) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                            <a href="{{ route('electricity-receipts.pdf', $receipt) }}" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i></a>
                            <form action="{{ route('electricity-receipts.destroy', $receipt) }}" method="POST"
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
                        <i class="bi bi-lightning-charge" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No electricity receipts yet.</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $receipts->links() }}</div>
@endsection
