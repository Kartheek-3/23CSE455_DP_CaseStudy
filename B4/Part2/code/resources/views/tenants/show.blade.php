@extends('layouts.app')

@section('title', 'Tenant Details')

@section('content')
<div class="mb-4">
    <a href="{{ route('tenants.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Tenants
    </a>
</div>

<div class="row">
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-body text-center py-4">
                <div class="user-avatar mx-auto mb-3" style="width:64px; height:64px; font-size:1.5rem;">
                    {{ strtoupper(substr($tenant->name, 0, 1)) }}
                </div>
                <h5 class="mb-1">{{ $tenant->name }}</h5>
                <p class="text-muted small mb-3">{{ $tenant->user->email ?? '—' }}</p>
                <span class="badge badge-success">Tenant</span>
            </div>
            <div class="card-body border-top" style="font-size: .875rem;">
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Phone</span>
                    <strong>{{ $tenant->phone }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">CNIC</span>
                    <strong>{{ $tenant->cnic ?? '—' }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Address</span>
                    <strong>{{ $tenant->address ?? '—' }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Registered</span>
                    <strong>{{ $tenant->created_at->format('d M Y') }}</strong>
                </div>
            </div>
            <div class="card-body border-top">
                <div class="d-flex gap-2">
                    <a href="{{ route('tenants.edit', $tenant) }}" class="btn btn-primary btn-sm flex-fill">
                        <i class="bi bi-pencil me-1"></i> Edit
                    </a>
                    <form action="{{ route('tenants.destroy', $tenant) }}" method="POST" class="flex-fill"
                        onsubmit="return confirm('Delete this tenant?')">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-outline-danger btn-sm w-100"><i class="bi bi-trash me-1"></i> Delete</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-house me-2"></i>Assigned Property</div>
            <div class="card-body">
                @if($tenant->property)
                <div style="font-size: .875rem;">
                    <div class="d-flex justify-content-between py-2">
                        <span class="text-muted">Address</span>
                        <strong>{{ $tenant->property->address }}</strong>
                    </div>
                    <div class="d-flex justify-content-between py-2">
                        <span class="text-muted">Owner</span>
                        <strong>{{ $tenant->property->owner->name ?? '—' }}</strong>
                    </div>
                    <div class="d-flex justify-content-between py-2">
                        <span class="text-muted">Monthly Rent</span>
                        <strong>Rs. {{ number_format($tenant->property->monthly_rent) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between py-2">
                        <span class="text-muted">Status</span>
                        <span class="badge badge-success">{{ ucfirst($tenant->property->status) }}</span>
                    </div>
                </div>
                @else
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-house" style="font-size: 2rem; opacity: .3;"></i>
                    <p class="mt-2 mb-0">No property assigned yet.</p>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
