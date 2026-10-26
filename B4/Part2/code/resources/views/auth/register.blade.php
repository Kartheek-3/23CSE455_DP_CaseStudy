@extends('layouts.app')

@section('title', 'Register New User')

@section('content')
@auth
    {{-- ADMIN VIEW: Clean form inside the dashboard --}}
    <div class="mb-4">
        <a href="{{ url('/home') }}" class="text-decoration-none small">
            <i class="bi bi-arrow-left me-1"></i> Back to Dashboard
        </a>
    </div>

    <div class="row justify-content-center">
        <div class="col-lg-7">
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-person-plus me-2"></i>Register New User
                </div>
                <div class="card-body">
                    <form method="POST" action="{{ route('register') }}">
                        @csrf

                        <div class="mb-3">
                            <label for="name" class="form-label">Full Name <span class="text-danger">*</span></label>
                            <input id="name" type="text"
                                   class="form-control @error('name') is-invalid @enderror"
                                   name="name" value="{{ old('name') }}"
                                   placeholder="Enter full name" required autofocus>
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                            <input id="email" type="email"
                                   class="form-control @error('email') is-invalid @enderror"
                                   name="email" value="{{ old('email') }}"
                                   placeholder="user@example.com" required>
                            @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                                <input id="password" type="password"
                                       class="form-control @error('password') is-invalid @enderror"
                                       name="password" placeholder="Min 8 characters" required>
                                @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="password-confirm" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                <input id="password-confirm" type="password"
                                       class="form-control" name="password_confirmation"
                                       placeholder="Repeat password" required>
                            </div>
                        </div>

                        <div class="p-3 rounded mb-3" style="background: var(--primary-light); font-size: .85rem;">
                            <i class="bi bi-shield-check me-1" style="color: var(--primary);"></i>
                            <strong>Note:</strong> This creates a new <strong>Admin</strong> user with full system access.
                            To add property owners or tenants, use the
                            <a href="{{ route('owners.create') }}">Add Owner</a> or
                            <a href="{{ route('tenants.create') }}">Add Tenant</a> pages instead.
                        </div>

                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-person-plus me-1"></i> Create User
                            </button>
                            <a href="{{ url('/home') }}" class="btn btn-light">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@else
    {{-- GUEST VIEW: First-time setup (no users in database) --}}
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">
                <div class="mb-3">
                    <span style="font-size: 2.5rem;"><i class="bi bi-building" style="color: var(--primary);"></i></span>
                </div>
                <h3>Initial Setup</h3>
                <p>Create the first admin account</p>
            </div>

            <form method="POST" action="{{ route('register') }}">
                @csrf

                <div class="mb-3">
                    <label for="name" class="form-label">Full Name</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i class="bi bi-person text-muted"></i></span>
                        <input id="name" type="text"
                               class="form-control @error('name') is-invalid @enderror"
                               name="name" value="{{ old('name') }}"
                               placeholder="Admin Name" required autofocus>
                    </div>
                    @error('name')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i class="bi bi-envelope text-muted"></i></span>
                        <input id="email" type="email"
                               class="form-control @error('email') is-invalid @enderror"
                               name="email" value="{{ old('email') }}"
                               placeholder="admin@example.com" required>
                    </div>
                    @error('email')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i class="bi bi-lock text-muted"></i></span>
                        <input id="password" type="password"
                               class="form-control @error('password') is-invalid @enderror"
                               name="password" placeholder="Min 8 characters" required>
                    </div>
                    @error('password')<div class="text-danger small mt-1">{{ $message }}</div>@enderror
                </div>

                <div class="mb-4">
                    <label for="password-confirm" class="form-label">Confirm Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i class="bi bi-lock-fill text-muted"></i></span>
                        <input id="password-confirm" type="password"
                               class="form-control" name="password_confirmation"
                               placeholder="Repeat password" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 mb-3">
                    <i class="bi bi-shield-check me-1"></i> Create Admin Account
                </button>
            </form>
        </div>
    </div>
@endauth
@endsection
