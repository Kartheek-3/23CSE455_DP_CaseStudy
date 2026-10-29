@extends('layouts.app')

@section('title', 'Owner Details')

@section('content')
<div class="mb-4">
    <a href="{{ route('owners.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Owners
    </a>
</div>

<div class="row">
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-body text-center py-4">
                <div class="user-avatar mx-auto mb-3" style="width:64px; height:64px; font-size:1.5rem;">
                    {{ strtoupper(substr($owner->name, 0, 1)) }}
                </div>
                <h5 class="mb-1">{{ $owner->name }}</h5>
                <p class="text-muted small mb-3">{{ $owner->user->email ?? '—' }}</p>
                <span class="badge badge-info">Owner</span>
            </div>
            <div class="card-body border-top" style="font-size: .875rem;">
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Phone</span>
                    <strong>{{ $owner->phone }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">CNIC</span>
                    <strong>{{ $owner->cnic ?? '—' }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Address</span>
                    <strong>{{ $owner->address ?? '—' }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Registered</span>
                    <strong>{{ $owner->created_at->format('d M Y') }}</strong>
                </div>
            </div>
            <div class="card-body border-top">
                <div class="d-flex gap-2">
                    <a href="{{ route('owners.edit', $owner) }}" class="btn btn-primary btn-sm flex-fill">
                        <i class="bi bi-pencil me-1"></i> Edit
                    </a>
                    <form action="{{ route('owners.destroy', $owner) }}" method="POST" class="flex-fill"
                          onsubmit="return confirm('Delete this owner?')">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-outline-danger btn-sm w-100">
                            <i class="bi bi-trash me-1"></i> Delete
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header">
                <i class="bi bi-houses me-2"></i>Properties ({{ $owner->properties->count() }})
            </div>
            <div class="card-body p-0">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>Tenant</th>
                            <th>Rent</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($owner->properties as $property)
                            <tr>
                                <td>{{ $property->address }}</td>
                                <td>{{ $property->tenant->name ?? '—' }}</td>
                                <td>Rs. {{ number_format($property->monthly_rent) }}</td>
                                <td>
                                    @if($property->status === 'occupied')
                                        <span class="badge badge-success">Occupied</span>
                                    @else
                                        <span class="badge badge-warning">Vacant</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center py-4 text-muted">
                                    No properties assigned yet.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
