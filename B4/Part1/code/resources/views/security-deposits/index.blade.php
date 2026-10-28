@extends('layouts.app')

@section('title', 'Security Deposits')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Track security deposits, deductions & refunds</p>
    <a href="{{ route('security-deposits.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> New Deposit
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Deposit</th>
                    <th>Deductions</th>
                    <th>Refunded</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($deposits as $deposit)
                <tr>
                    <td>{{ $loop->iteration + ($deposits->currentPage() - 1) * $deposits->perPage() }}</td>
                    <td><strong>{{ $deposit->tenant->name }}</strong></td>
                    <td>{{ Str::limit($deposit->property->address, 25) }}</td>
                    <td>Rs. {{ number_format($deposit->total_amount) }}</td>
                    <td style="color: #991b1b;">Rs. {{ number_format($deposit->total_deductions) }}</td>
                    <td style="color: #166534;">Rs. {{ number_format($deposit->refunded_amount) }}</td>
                    <td><strong>Rs. {{ number_format($deposit->balance) }}</strong></td>
                    <td>
                        @if($deposit->status === 'held')
                        <span class="badge badge-info">Held</span>
                        @elseif($deposit->status === 'partially_refunded')
                        <span class="badge badge-warning">Partial Refund</span>
                        @elseif($deposit->status === 'fully_refunded')
                        <span class="badge badge-success">Fully Refunded</span>
                        @else
                        <span class="badge badge-danger">Forfeited</span>
                        @endif
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('security-deposits.show', $deposit) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('security-deposits.edit', $deposit) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        <i class="bi bi-shield-lock" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No security deposits recorded yet.</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $deposits->links() }}</div>
@endsection
