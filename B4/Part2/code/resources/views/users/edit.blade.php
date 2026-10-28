@extends('layouts.app')

@section('title', 'Edit User')

@section('content')
<div class="mb-4">
    <a href="{{ route('users.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Users
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-person-gear me-2"></i>Edit User &mdash; {{ $user->name }}</div>
            <div class="card-body">
                @if($user->owner || $user->tenant)
                <div class="alert alert-info d-flex gap-2" style="background:#eff6ff;color:#1e40af;border-left:4px solid #2563eb;">
                    <i class="bi bi-info-circle mt-1"></i>
                    <div>
                        This user is linked to a
                        <strong>{{ $user->owner ? 'Owner' : 'Tenant' }}</strong> profile.
                        You can update their login details here; profile details are managed in the
                        <a href="{{ $user->owner ? route('owners.index') : route('tenants.index') }}">{{ $user->owner ? 'Owners' : 'Tenants' }}</a> section.
                    </div>
                </div>
                @endif

                <form action="{{ route('users.update', $user) }}" method="POST">
                    @csrf
                    @method('PUT')

                    <h6 class="text-muted mb-3">Account Information</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="name" class="form-label">Full Name <span class="text-danger">*</span></label>
                            <input type="text" name="name" id="name"
                                class="form-control @error('name') is-invalid @enderror"
                                value="{{ old('name', $user->name) }}">
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                            <input type="email" name="email" id="email"
                                class="form-control @error('email') is-invalid @enderror"
                                value="{{ old('email', $user->email) }}">
                            @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <input type="text" class="form-control" value="{{ ucfirst($user->role) }}" disabled style="background:#f8fafc;">
                        <small class="text-muted">Roles are assigned when the account is created and cannot be changed here.</small>
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Reset Password <span class="fw-normal small">(optional)</span></h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="password" class="form-label">New Password</label>
                            <input type="password" name="password" id="password"
                                class="form-control @error('password') is-invalid @enderror"
                                placeholder="Leave blank to keep current">
                            @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="password_confirmation" class="form-label">Confirm New Password</label>
                            <input type="password" name="password_confirmation" id="password_confirmation"
                                class="form-control" placeholder="Repeat new password">
                        </div>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Save Changes</button>
                        <a href="{{ route('users.index') }}" class="btn btn-light">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
