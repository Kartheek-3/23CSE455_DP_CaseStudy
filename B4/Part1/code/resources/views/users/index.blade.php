@extends('layouts.app')

@section('title', 'User Management')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
        <h1 class="h4 fw-bold mb-1">User Management</h1>
        <p class="text-muted small mb-0">Manage user accounts, roles &amp; access.</p>
    </div>
    <a href="{{ route('users.create') }}" class="btn btn-primary">
        <i class="bi bi-person-plus me-1"></i> Add Administrator
    </a>
</div>

{{-- Stats --}}
<div class="row g-3 mb-4">
    <div class="col-6 col-lg-3">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #eef2ff; color: #4f46e5;"><i class="bi bi-people"></i></div>
                <div>
                    <div class="metric-label">Total Users</div>
                    <div class="metric-value">{{ $stats['total'] }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #eff6ff; color: #2563eb;"><i class="bi bi-shield-lock"></i></div>
                <div>
                    <div class="metric-label">Administrators</div>
                    <div class="metric-value">{{ $stats['admins'] }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #dcfce7; color: #16a34a;"><i class="bi bi-person-badge"></i></div>
                <div>
                    <div class="metric-label">Owners</div>
                    <div class="metric-value">{{ $stats['owners'] }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card metric-card">
            <div class="metric-top">
                <div class="metric-icon" style="background: #fef3c7; color: #d97706;"><i class="bi bi-person"></i></div>
                <div>
                    <div class="metric-label">Tenants</div>
                    <div class="metric-value">{{ $stats['tenants'] }}</div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($users as $user)
                <tr>
                    <td>{{ $loop->iteration + ($users->currentPage() - 1) * $users->perPage() }}</td>
                    <td>
                        <span class="receipt-type">
                            <span class="type-ico" style="background: #eef2ff; color: #4f46e5;">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </span>
                            <strong>{{ $user->name }}</strong>
                            @if($user->id === auth()->id())
                            <span class="badge badge-info ms-1">You</span>
                            @endif
                        </span>
                    </td>
                    <td>{{ $user->email }}</td>
                    <td>
                        @php
                        $roleMap = [
                            'admin' => ['badge-info', 'Administrator'],
                            'owner' => ['badge-success', 'Owner'],
                            'tenant' => ['badge-warning', 'Tenant'],
                        ];
                        [$roleClass, $roleLabel] = $roleMap[$user->role] ?? ['badge-info', ucfirst($user->role)];
                        @endphp
                        <span class="badge {{ $roleClass }}">{{ $roleLabel }}</span>
                    </td>
                    <td>{{ $user->created_at->format('d M Y') }}</td>
                    <td>
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('users.edit', $user) }}" class="btn btn-sm btn-outline-primary" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </a>
                            @if($user->id !== auth()->id())
                            <form action="{{ route('users.destroy', $user) }}" method="POST"
                                onsubmit="return confirm('Delete {{ $user->name }}? This will also remove any linked owner/tenant profile and its records.')">
                                @csrf
                                @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger" title="Delete"><i class="bi bi-trash"></i></button>
                            </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="bi bi-people" style="font-size: 2rem; opacity: .3;"></i>
                        <p class="mt-2 mb-0">No users found.</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<div class="mt-3">{{ $users->links() }}</div>
@endsection
