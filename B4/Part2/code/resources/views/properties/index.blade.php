@extends('layouts.app')

@section('title', 'Properties')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Manage rental properties</p>
    <a href="{{ route('properties.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> Add Property
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Address</th>
                    <th>Owner</th>
                    <th>Tenant</th>
                    <th>Rent (Rs.)</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($properties as $property)
                <tr>
                    <td>{{ $loop->iteration + ($properties->currentPage() - 1) * $properties->perPage() }}</td>
                    <td><strong>{{ Str::limit($property->address, 40) }}</strong></td>
                    <td>{{ $property->owner->name ?? '—' }}</td>
                    <td>
                        @if($property->tenant)
                        {{ $property->tenant->name }}
                        @else
                        <span class="text-muted">—</span>
                        @endif
                    </td>
                    <td>{{ number_format($property->monthly_rent) }}</td>
                    <td>
                        @if($property->status === 'occupied')
                        <span class="badge badge-success">Occupied</span>
                        @else
                        <span class="badge badge-warning">Vacant</span>
                        @endif
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('properties.show', $property) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('properties.edit', $property) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                            <form action="{{ route('properties.destroy', $property) }}" method="POST"
                                onsubmit="return confirm('Delete this property?')">
                                @csrf
                                @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="bi bi-houses" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No properties found. Add your first property!</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $properties->links() }}</div>
@endsection
