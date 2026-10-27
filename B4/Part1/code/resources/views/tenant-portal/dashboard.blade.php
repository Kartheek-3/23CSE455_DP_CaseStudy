@extends('layouts.app')

@section('title', 'My Dashboard')

@section('content')
{{-- Welcome --}}
<div class="p-4 mb-4 rounded" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff;">
    <h4 class="mb-1">Welcome, {{ $tenant->name }}!</h4>
    <p class="mb-0 small" style="opacity: .85;">
        {{ $tenant->property->address ?? 'No property assigned' }} · Rent: Rs. {{ number_format($tenant->property->monthly_rent ?? 0) }}/month
    </p>
</div>

{{-- Stats --}}
<div class="row g-4 mb-4">
    <div class="col-md-3">
        <div class="card stat-card">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stat-label">Total Rent Paid</div>
                        <div class="stat-value">Rs. {{ number_format($stats['total_rent_paid']) }}</div>
                        <small class="text-muted">{{ $stats['rent_receipts_count'] }} receipts</small>
                    </div>
                    <div class="stat-icon" style="background: #eef2ff; color: #4f46e5;">
                        <i class="bi bi-receipt"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card stat-card">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stat-label">Maintenance Paid</div>
                        <div class="stat-value">Rs. {{ number_format($stats['total_maintenance_paid']) }}</div>
                        <small class="text-muted">{{ $stats['maintenance_receipts_count'] }} receipts</small>
                    </div>
                    <div class="stat-icon" style="background: #fefce8; color: #92400e;">
                        <i class="bi bi-tools"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card stat-card">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stat-label">Electricity Paid</div>
                        <div class="stat-value">Rs. {{ number_format($stats['total_electricity_paid']) }}</div>
                        <small class="text-muted">{{ $stats['electricity_receipts_count'] }} receipts</small>
                    </div>
                    <div class="stat-icon" style="background: #fee2e2; color: #991b1b;">
                        <i class="bi bi-lightning-charge"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card stat-card">
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stat-label">Security Deposit</div>
                        <div class="stat-value">Rs. {{ number_format($stats['security_deposit']) }}</div>
                        <small class="text-muted">Currently held</small>
                    </div>
                    <div class="stat-icon" style="background: #dcfce7; color: #166534;">
                        <i class="bi bi-shield-lock"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Recent Receipts --}}
<div class="row g-4">
    <div class="col-md-4">
        <div class="card">
            <div class="card-header"><i class="bi bi-receipt me-2"></i>Recent Rent</div>
            <div class="card-body p-0">
                @forelse($recentRent as $r)
                <a href="{{ route('tenant.rent-receipts.show', $r) }}" class="d-flex justify-content-between px-3 py-2 border-bottom text-decoration-none" style="font-size: .85rem;">
                    <span class="text-dark">{{ $r->month }}</span>
                    <strong>Rs. {{ number_format($r->amount) }}</strong>
                </a>
                @empty
                <div class="text-center py-3 text-muted small">No rent receipts yet.</div>
                @endforelse
            </div>
            <div class="card-body border-top py-2">
                <a href="{{ route('tenant.rent-receipts') }}" class="small text-decoration-none">View all <i class="bi bi-arrow-right"></i></a>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-header"><i class="bi bi-tools me-2"></i>Recent Maintenance</div>
            <div class="card-body p-0">
                @forelse($recentMaintenance as $r)
                <a href="{{ route('tenant.maintenance-receipts.show', $r) }}" class="d-flex justify-content-between px-3 py-2 border-bottom text-decoration-none" style="font-size: .85rem;">
                    <span class="text-dark">{{ $r->month }}</span>
                    <strong>Rs. {{ number_format($r->tenant_share) }}</strong>
                </a>
                @empty
                <div class="text-center py-3 text-muted small">No maintenance receipts yet.</div>
                @endforelse
            </div>
            <div class="card-body border-top py-2">
                <a href="{{ route('tenant.maintenance-receipts') }}" class="small text-decoration-none">View all <i class="bi bi-arrow-right"></i></a>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-header"><i class="bi bi-lightning-charge me-2"></i>Recent Electricity</div>
            <div class="card-body p-0">
                @forelse($recentElectricity as $r)
                <a href="{{ route('tenant.electricity-receipts.show', $r) }}" class="d-flex justify-content-between px-3 py-2 border-bottom text-decoration-none" style="font-size: .85rem;">
                    <span class="text-dark">{{ $r->month }}</span>
                    <strong>Rs. {{ number_format($r->tenant_bill) }}</strong>
                </a>
                @empty
                <div class="text-center py-3 text-muted small">No electricity receipts yet.</div>
                @endforelse
            </div>
            <div class="card-body border-top py-2">
                <a href="{{ route('tenant.electricity-receipts') }}" class="small text-decoration-none">View all <i class="bi bi-arrow-right"></i></a>
            </div>
        </div>
    </div>
</div>
@endsection
