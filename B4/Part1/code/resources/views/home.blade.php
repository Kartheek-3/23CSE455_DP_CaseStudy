@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')

{{-- Welcome hero --}}
<div class="dash-hero mb-4">
    <h1>Dashboard</h1>
    <p>Welcome back, {{ auth()->user()->name }} 👋</p>
</div>

{{-- Stats Row 1: Main Counts --}}
<div class="row g-4 mb-4">
    <div class="col-xl-3 col-md-6">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #eef2ff; color: #4f46e5;">
                    <i class="bi bi-houses"></i>
                </div>
                <div>
                    <div class="metric-label">Total Properties</div>
                    <div class="metric-value">{{ $stats['total_properties'] }}</div>
                </div>
            </div>
            <div class="metric-foot">
                <span class="dot-stat" style="color: #16a34a;">{{ $stats['occupied_properties'] }} occupied</span>
                <span class="dot-stat" style="color: #d97706;">{{ $stats['vacant_properties'] }} vacant</span>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #dcfce7; color: #16a34a;">
                    <i class="bi bi-people"></i>
                </div>
                <div>
                    <div class="metric-label">Active Tenants</div>
                    <div class="metric-value">{{ $stats['active_tenants'] }}</div>
                </div>
            </div>
            <div class="metric-foot">
                <span class="dot-stat" style="color: #16a34a;">{{ $stats['total_tenants'] }} total registered</span>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #ede9fe; color: #6d28d9;">
                    <i class="bi bi-wallet2"></i>
                </div>
                <div>
                    <div class="metric-label">Rent Collected</div>
                    <div class="metric-value">Rs. {{ number_format($stats['total_rent_collected']) }}</div>
                </div>
            </div>
            <div class="metric-foot">
                {{ $stats['rent_receipts'] }} receipts total
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #fee2e2; color: #dc2626;">
                    <i class="bi bi-shield-lock"></i>
                </div>
                <div>
                    <div class="metric-label">Security Deposits Held</div>
                    <div class="metric-value">Rs. {{ number_format($stats['security_held']) }}</div>
                </div>
            </div>
            <div class="metric-foot">
                {{ $stats['total_owners'] }} owners registered
            </div>
        </div>
    </div>
</div>

{{-- Stats Row 2: Bill Collections --}}
<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card bill-card">
            <div>
                <div class="metric-label">This Month's Rent</div>
                <div class="metric-value" style="color: #16a34a;">Rs. {{ number_format($stats['rent_this_month']) }}</div>
                <div class="metric-sub">{{ now()->format('F Y') }}</div>
            </div>
            <div class="bill-icon" style="background: #dcfce7; color: #16a34a;">
                <i class="bi bi-bar-chart-line"></i>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card bill-card">
            <div>
                <div class="metric-label">Total Maintenance Collected</div>
                <div class="metric-value" style="color: #ea9d0b;">Rs. {{ number_format($stats['total_maintenance']) }}</div>
                <div class="metric-sub">{{ $stats['maintenance_receipts'] }} receipts</div>
            </div>
            <div class="bill-icon" style="background: #fef3c7; color: #d97706;">
                <i class="bi bi-tools"></i>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card bill-card">
            <div>
                <div class="metric-label">Total Electricity Collected</div>
                <div class="metric-value" style="color: #ef4444;">Rs. {{ number_format($stats['total_electricity']) }}</div>
                <div class="metric-sub">{{ $stats['electricity_receipts'] }} receipts</div>
            </div>
            <div class="bill-icon" style="background: #fee2e2; color: #ef4444;">
                <i class="bi bi-lightning-charge-fill"></i>
            </div>
        </div>
    </div>
</div>

{{-- Recent Receipts + Side panels --}}
<div class="row g-4">
    <div class="col-lg-8">
        <div class="card section-card">
            <div class="card-header">
                <span class="card-title"><i class="bi bi-file-earmark-text"></i> Recent Receipts</span>
                <a href="{{ route('rent-receipts.index') }}" class="btn-viewall">View All</a>
            </div>
            <div class="card-body p-0">
                @if($recentReceipts->count() > 0)
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Month</th>
                            <th>Tenant</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($recentReceipts as $receipt)
                        <tr>
                            <td>
                                <span class="receipt-type">
                                    <span class="type-ico" style="background: {{ $receipt['color'] }}1a; color: {{ $receipt['color'] }};">
                                        <i class="bi {{ $receipt['icon'] }}"></i>
                                    </span>
                                    {{ $receipt['type'] }}
                                </span>
                            </td>
                            <td>{{ $receipt['month'] }}</td>
                            <td>{{ $receipt['tenant'] }}</td>
                            <td><strong>Rs. {{ number_format($receipt['amount']) }}</strong></td>
                            <td>{{ $receipt['date']->format('d/m/Y') }}</td>
                            <td class="text-end">
                                <a href="{{ $receipt['url'] }}" class="btn-eye" title="View receipt">
                                    <i class="bi bi-eye"></i>
                                </a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                <div class="table-footer">
                    <span>Showing 1 to {{ $recentReceipts->count() }} of {{ $recentReceipts->count() }} receipts</span>
                    <div class="pager">
                        <span class="disabled"><i class="bi bi-chevron-left"></i></span>
                        <span class="active">1</span>
                        <span class="disabled"><i class="bi bi-chevron-right"></i></span>
                    </div>
                </div>
                @else
                <div class="text-center py-5 text-muted">
                    <i class="bi bi-receipt" style="font-size: 3rem; opacity: .3;"></i>
                    <p class="mt-2">No receipts generated yet.<br>Start by adding owners, tenants and properties.</p>
                </div>
                @endif
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        {{-- Quick Actions --}}
        <div class="card section-card mb-4">
            <div class="card-header">
                <span class="card-title"><i class="bi bi-lightning-charge-fill"></i> Quick Actions</span>
            </div>
            <div class="card-body d-grid gap-2">
                <a href="{{ route('rent-receipts.create') }}" class="qa-item">
                    <span class="qa-ico"><i class="bi bi-receipt"></i></span>
                    New Rent Receipt
                    <i class="bi bi-chevron-right qa-arrow"></i>
                </a>
                <a href="{{ route('maintenance-receipts.create') }}" class="qa-item">
                    <span class="qa-ico"><i class="bi bi-tools"></i></span>
                    New Maintenance Bill
                    <i class="bi bi-chevron-right qa-arrow"></i>
                </a>
                <a href="{{ route('electricity-receipts.create') }}" class="qa-item">
                    <span class="qa-ico"><i class="bi bi-lightning-charge"></i></span>
                    New Electricity Bill
                    <i class="bi bi-chevron-right qa-arrow"></i>
                </a>
                <a href="{{ route('security-deposits.create') }}" class="qa-item">
                    <span class="qa-ico"><i class="bi bi-shield-lock"></i></span>
                    Record Security Deposit
                    <i class="bi bi-chevron-right qa-arrow"></i>
                </a>
                @if(auth()->user()->isAdmin())
                <a href="{{ route('properties.create') }}" class="qa-item">
                    <span class="qa-ico"><i class="bi bi-house-add"></i></span>
                    Add Property
                    <i class="bi bi-chevron-right qa-arrow"></i>
                </a>
                @endif
            </div>
        </div>

        {{-- Properties Overview --}}
        <div class="card section-card">
            <div class="card-header">
                <span class="card-title"><i class="bi bi-houses"></i> Properties Overview</span>
            </div>
            <div class="card-body">
                @if($featuredProperty)
                <div class="property-feature">
                    <div class="property-thumb">
                        <i class="bi bi-house-door-fill"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <span class="prop-addr">{{ Str::limit($featuredProperty->address, 32) }}</span>
                            @if($featuredProperty->status === 'occupied')
                            <span class="badge badge-success">Occupied</span>
                            @else
                            <span class="badge badge-warning">Vacant</span>
                            @endif
                        </div>
                        <div class="prop-meta">Tenant: {{ $featuredProperty->tenant->name ?? 'Vacant' }}</div>
                        <div class="prop-meta">Monthly Rent: Rs. {{ number_format($featuredProperty->monthly_rent) }}</div>
                        <a href="{{ route('properties.show', $featuredProperty) }}" class="prop-link mt-2 d-inline-block">
                            View Details <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>
                </div>
                @else
                <div class="text-center py-3 text-muted small">
                    No properties yet.
                    @if(auth()->user()->isAdmin())
                    <br><a href="{{ route('properties.create') }}" class="prop-link">Add your first property</a>
                    @endif
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
