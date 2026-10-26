@extends('layouts.app')

@section('title', 'Tenants')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Manage property tenants</p>
    <a href="{{ route('tenants.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> Add Tenant
    </a>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>CNIC</th>
                    <th>Property</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($tenants as $tenant)
                <tr>
                    <td>{{ $loop->iteration + ($tenants->currentPage() - 1) * $tenants->perPage() }}</td>
                    <td><strong>{{ $tenant->name }}</strong></td>
                    <td>{{ $tenant->phone }}</td>
                    <td>{{ $tenant->user->email ?? '—' }}</td>
                    <td>{{ $tenant->cnic ?? '—' }}</td>
                    <td>
                        @if($tenant->property)
                        <span class="badge badge-success">{{ Str::limit($tenant->property->address, 30) }}</span>
                        @else
                        <span class="badge badge-warning">Unassigned</span>
                        @endif
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <a href="{{ route('tenants.show', $tenant) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('tenants.edit', $tenant) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                            <form action="{{ route('tenants.destroy', $tenant) }}" method="POST"
                                onsubmit="return confirm('Delete this tenant?')">
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
                        <i class="bi bi-people" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No tenants found. Add your first tenant!</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $tenants->links() }}</div>
@endsection
