@extends('layouts.app')

@section('title', 'Add Administrator')

@section('content')
<div class="mb-4">
    <a href="{{ route('users.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Users
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-person-plus me-2"></i>Add New Administrator</div>
            <div class="card-body">
                <div class="alert alert-info d-flex gap-2" style="background:#eff6ff;color:#1e40af;border-left:4px solid #2563eb;">
                    <i class="bi bi-info-circle mt-1"></i>
                    <div>
                        This form creates an <strong>administrator</strong> account.
                        To add owners or tenants, use the
                        <a href="{{ route('owners.create') }}">Owners</a> or
                        <a href="{{ route('tenants.create') }}">Tenants</a> sections so their profiles are linked correctly.
                    </div>
                </div>

                <form action="{{ route('users.store') }}" method="POST">
                    @csrf

                    <div class="mb-3">
                        <label for="name" class="form-label">Full Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" id="name"
                            class="form-control @error('name') is-invalid @enderror"
                            value="{{ old('name') }}" placeholder="e.g. Mohsin Rafique">
                        @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                        <input type="email" name="email" id="email"
                            class="form-control @error('email') is-invalid @enderror"
                            value="{{ old('email') }}" placeholder="admin@example.com">
                        @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                            <input type="password" name="password" id="password"
                                class="form-control @error('password') is-invalid @enderror"
                                placeholder="Min 8 characters">
                            @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="password_confirmation" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                            <input type="password" name="password_confirmation" id="password_confirmation"
                                class="form-control" placeholder="Repeat password">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <input type="text" class="form-control" value="Administrator" disabled style="background:#f8fafc;">
                        <small class="text-muted">New users created here are administrators.</small>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Create Administrator</button>
                        <a href="{{ route('users.index') }}" class="btn btn-light">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
