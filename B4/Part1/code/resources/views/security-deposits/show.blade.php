@extends('layouts.app')

@section('title', 'Security Deposit — ' . $securityDeposit->tenant->name)

@section('content')
<div class="mb-4">
    <a href="{{ route('security-deposits.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Security Deposits
    </a>
</div>

<div class="row">
    {{-- Deposit Summary --}}
    <div class="col-lg-5 mb-4">
        <div class="card">
            <div class="card-header"><i class="bi bi-shield-lock me-2"></i>Deposit Summary</div>
            <div class="card-body" style="font-size: .875rem;">
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Tenant</span>
                    <strong>{{ $securityDeposit->tenant->name }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Property</span>
                    <strong>{{ Str::limit($securityDeposit->property->address, 30) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Rent at Time</span>
                    <strong>Rs. {{ number_format($securityDeposit->monthly_rent_at_time) }}/month</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Security Months</span>
                    <strong>{{ $securityDeposit->months_count }} months</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Deposit Date</span>
                    <strong>{{ $securityDeposit->deposit_date->format('d M Y') }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Payment Method</span>
                    <strong>{{ ucfirst(str_replace('_', ' ', $securityDeposit->payment_method)) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Status</span>
                    @if($securityDeposit->status === 'held')
                    <span class="badge badge-info">Held</span>
                    @elseif($securityDeposit->status === 'partially_refunded')
                    <span class="badge badge-warning">Partially Refunded</span>
                    @elseif($securityDeposit->status === 'fully_refunded')
                    <span class="badge badge-success">Fully Refunded</span>
                    @else
                    <span class="badge badge-danger">Forfeited</span>
                    @endif
                </div>
            </div>

            {{-- Financial Summary --}}
            <div class="card-body border-top">
                <div class="d-flex justify-content-between py-2">
                    <span>Total Deposit</span>
                    <strong>Rs. {{ number_format($securityDeposit->total_amount) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2" style="color: #991b1b;">
                    <span>Total Deductions</span>
                    <strong>- Rs. {{ number_format($securityDeposit->total_deductions) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2" style="color: #166534;">
                    <span>Refunded</span>
                    <strong>- Rs. {{ number_format($securityDeposit->refunded_amount) }}</strong>
                </div>
                <hr class="my-1">
                <div class="d-flex justify-content-between py-2 fs-5">
                    <strong>Balance</strong>
                    <strong style="color: #16A34A;">Rs. {{ number_format($securityDeposit->balance) }}</strong>
                </div>
            </div>

            <div class="card-body border-top">
                <a href="{{ route('security-deposits.edit', $securityDeposit) }}" class="btn btn-outline-primary btn-sm w-100 mb-2">
                    <i class="bi bi-pencil me-1"></i> Edit Deposit
                </a>
                <a href="{{ route('security-deposits.pdf', $securityDeposit) }}" class="btn btn-outline-danger btn-sm w-100">
                    <i class="bi bi-file-pdf me-1"></i> Download PDF
                </a>
            </div>
        </div>
    </div>

    <div class="col-lg-7">
        {{-- Deductions List --}}
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-scissors me-2"></i>Deductions</span>
                <span class="badge badge-danger">{{ $securityDeposit->deductions->count() }} deductions</span>
            </div>
            <div class="card-body p-0">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reason</th>
                            <th class="text-end">Amount</th>
                            <th>Proof</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($securityDeposit->deductions as $deduction)
                        <tr>
                            <td>{{ $deduction->deduction_date->format('d/m/Y') }}</td>
                            <td>
                                {{ $deduction->reason }}
                                @if($deduction->notes)
                                <br><small class="text-muted">{{ $deduction->notes }}</small>
                                @endif
                            </td>
                            <td class="text-end" style="color: #991b1b; font-weight: 600;">
                                Rs. {{ number_format($deduction->amount) }}
                            </td>
                            <td>
                                @if($deduction->attachment)
                                <a href="{{ asset('storage/' . $deduction->attachment) }}" target="_blank"
                                    class="btn btn-sm btn-outline-primary"><i class="bi bi-paperclip"></i></a>
                                @else
                                <span class="text-muted">—</span>
                                @endif
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="4" class="text-center py-3 text-muted">No deductions yet.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        {{-- Add Deduction Form --}}
        @if($securityDeposit->balance > 0 && $securityDeposit->status !== 'fully_refunded')
        <div class="card mb-4">
            <div class="card-header" style="background: #fee2e2; color: #991b1b;">
                <i class="bi bi-scissors me-2"></i>Add Deduction
            </div>
            <div class="card-body">
                <form action="{{ route('security-deposits.deduction', $securityDeposit) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="amount" class="form-label">Amount (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="amount" id="amount" step="0.01"
                                class="form-control @error('amount') is-invalid @enderror"
                                max="{{ $securityDeposit->balance }}" placeholder="Max: {{ number_format($securityDeposit->balance) }}">
                            @error('amount')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="reason" class="form-label">Reason <span class="text-danger">*</span></label>
                            <input type="text" name="reason" id="reason"
                                class="form-control @error('reason') is-invalid @enderror"
                                placeholder="e.g. Wall damage repair">
                            @error('reason')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="deduction_date" class="form-label">Date <span class="text-danger">*</span></label>
                            <input type="date" name="deduction_date" id="deduction_date"
                                class="form-control" value="{{ date('Y-m-d') }}">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="deduction_notes" class="form-label">Notes</label>
                            <input type="text" name="notes" class="form-control" placeholder="Optional details">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="attachment" class="form-label">Proof/Photo</label>
                            <input type="file" name="attachment" class="form-control" accept=".pdf,.jpg,.jpeg,.png">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-danger btn-sm">
                        <i class="bi bi-scissors me-1"></i> Add Deduction
                    </button>
                </form>
            </div>
        </div>

        {{-- Process Refund Form --}}
        <div class="card">
            <div class="card-header" style="background: #dcfce7; color: #166534;">
                <i class="bi bi-cash-stack me-2"></i>Process Refund
            </div>
            <div class="card-body">
                <form action="{{ route('security-deposits.refund', $securityDeposit) }}" method="POST">
                    @csrf
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="refund_amount" class="form-label">Refund Amount (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="refund_amount" id="refund_amount" step="0.01"
                                class="form-control @error('refund_amount') is-invalid @enderror"
                                value="{{ $securityDeposit->balance }}"
                                max="{{ $securityDeposit->balance }}">
                            @error('refund_amount')<div class="invalid-feedback">{{ $message }}</div>@enderror
                            <small class="text-muted">Available: Rs. {{ number_format($securityDeposit->balance) }}</small>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="refund_date" class="form-label">Refund Date <span class="text-danger">*</span></label>
                            <input type="date" name="refund_date" id="refund_date"
                                class="form-control" value="{{ date('Y-m-d') }}">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="refund_notes" class="form-label">Notes</label>
                            <input type="text" name="refund_notes" class="form-control" placeholder="Optional">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-success btn-sm"
                        onclick="return confirm('Refund Rs. ' + document.getElementById('refund_amount').value + ' to {{ $securityDeposit->tenant->name }}?')">
                        <i class="bi bi-cash-stack me-1"></i> Process Refund
                    </button>
                </form>
            </div>
        </div>
        @else
        <div class="card">
            <div class="card-body text-center py-4">
                <i class="bi bi-check-circle" style="font-size: 2.5rem; color: #22c55e;"></i>
                <p class="mt-2 mb-0"><strong>This deposit has been fully settled.</strong></p>
                @if($securityDeposit->refund_date)
                <p class="text-muted small">Refunded on {{ $securityDeposit->refund_date->format('d M Y') }}</p>
                @endif
            </div>
        </div>
        @endif
    </div>
</div>
@endsection
