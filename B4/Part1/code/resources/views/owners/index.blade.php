@extends('layouts.app')

@section('title', 'Owners')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <p class="text-muted small mb-0">Manage property owners</p>
    <a href="{{ route('owners.create') }}" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> Add Owner
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
                    <th>Properties</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($owners as $owner)
                    <tr>
                        <td>{{ $loop->iteration + ($owners->currentPage() - 1) * $owners->perPage() }}</td>
                        <td>
                            <strong>{{ $owner->name }}</strong>
                        </td>
                        <td>{{ $owner->phone }}</td>
                        <td>{{ $owner->user->email ?? '—' }}</td>
                        <td>{{ $owner->cnic ?? '—' }}</td>
                        <td>
                            <span class="badge badge-info">{{ $owner->properties_count }}</span>
                        </td>
                        <td>
                            <div class="d-flex gap-1">
                                <a href="{{ route('owners.show', $owner) }}"
                                   class="btn btn-sm btn-outline-primary" title="View">
                                    <i class="bi bi-eye"></i>
                                </a>
                                <a href="{{ route('owners.edit', $owner) }}"
                                   class="btn btn-sm btn-outline-primary" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </a>
                                <form action="{{ route('owners.destroy', $owner) }}"
                                      method="POST"
                                      onsubmit="return confirm('Are you sure you want to delete this owner?')">
                                    @csrf
                                    @method('DELETE')
                                    <button class="btn btn-sm btn-outline-danger" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center py-4 text-muted">
                            <i class="bi bi-person-badge" style="font-size: 2rem; opacity: .3;"></i>
                            <p class="mt-2 mb-0">No owners found. Add your first owner!</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

{{-- Pagination --}}
<div class="mt-3">
    {{ $owners->links() }}
</div>
@endsection
