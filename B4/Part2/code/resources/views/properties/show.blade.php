@extends('layouts.app')

@section('title', 'Property Details')

@section('content')
<div class="mb-4">
    <a href="{{ route('properties.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Properties
    </a>
</div>

<div class="row">
    <div class="col-lg-5 mb-4">
        <div class="card">
            <div class="card-header"><i class="bi bi-house me-2"></i>Property Info</div>
            <div class="card-body" style="font-size: .875rem;">
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Address</span>
                    <strong>{{ $property->address }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Owner</span>
                    <strong>{{ $property->owner->name }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Tenant</span>
                    <strong>{{ $property->tenant->name ?? 'Vacant' }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Monthly Rent</span>
                    <strong>Rs. {{ number_format($property->monthly_rent) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Electricity Rate</span>
                    <strong>Rs. {{ $property->electricity_rate_per_unit }}/unit</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Maintenance</span>
                    <strong>Rs. {{ number_format($property->maintenance_total) }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Split</span>
                    <strong>Owner {{ $property->owner_maintenance_percent }}% / Tenant {{ $property->tenant_maintenance_percent }}%</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Status</span>
                    @if($property->status === 'occupied')
                    <span class="badge badge-success">Occupied</span>
                    @else
                    <span class="badge badge-warning">Vacant</span>
                    @endif
                </div>
            </div>
            <div class="card-body border-top">
                <div class="d-flex gap-2">
                    <a href="{{ route('properties.edit', $property) }}" class="btn btn-primary btn-sm flex-fill">
                        <i class="bi bi-pencil me-1"></i> Edit
                    </a>
                    <form action="{{ route('properties.destroy', $property) }}" method="POST" class="flex-fill"
                        onsubmit="return confirm('Delete this property?')">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-outline-danger btn-sm w-100"><i class="bi bi-trash me-1"></i> Delete</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        {{-- Rate Change History --}}
        <div class="card mb-4">
            <div class="card-header">
                <i class="bi bi-clock-history me-2"></i>Rate Change History
            </div>
            <div class="card-body p-0">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Old Rate</th>
                            <th>New Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($property->rateHistories()->latest()->take(10)->get() as $history)
                            <tr>
                                <td>{{ $history->effective_date->format('d M Y') }}</td>
                                <td>
                                    @if($history->type === 'electricity_rate')
                                        <span class="badge badge-warning">Electricity</span>
                                    @elseif($history->type === 'maintenance')
                                        <span class="badge badge-info">Maintenance</span>
                                    @else
                                        <span class="badge badge-success">Rent</span>
                                    @endif
                                </td>
                                <td>Rs. {{ number_format($history->old_value, 2) }}</td>
                                <td>Rs. {{ number_format($history->new_value, 2) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center py-4 text-muted">
                                    No rate changes recorded yet.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        {{-- Recent Receipts --}}
        <div class="card">
            <div class="card-header"><i class="bi bi-receipt me-2"></i>Recent Receipts</div>
            <div class="card-body text-center py-4 text-muted">
                <p class="mb-0">Receipt history will appear here once generated.</p>
            </div>
        </div>
    </div>
</div>
@endsection
