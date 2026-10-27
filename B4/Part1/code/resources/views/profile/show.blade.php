@extends('layouts.app')

@section('title', 'Profile Settings')

@section('content')
<div class="row">
    {{-- Profile Card --}}
    <div class="col-lg-4 mb-4">
        <div class="card">
            <div class="card-body text-center py-4">
                <div class="user-avatar mx-auto mb-3" style="width: 80px; height: 80px; font-size: 2rem;">
                    {{ strtoupper(substr($user->name, 0, 1)) }}
                </div>
                <h5 class="mb-1">{{ $user->name }}</h5>
                <p class="text-muted small mb-2">{{ $user->email }}</p>
                <span class="badge badge-info">{{ ucfirst($user->role) }}</span>
            </div>
            <div class="card-body border-top" style="font-size: .875rem;">
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Member Since</span>
                    <strong>{{ $user->created_at->format('d M Y') }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Last Updated</span>
                    <strong>{{ $user->updated_at->format('d M Y, h:i A') }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Role</span>
                    <strong>{{ ucfirst($user->role) }}</strong>
                </div>
            </div>

            {{-- Quick Stats --}}
            @if($user->isAdmin())
            <div class="card-body border-top" style="font-size: .875rem;">
                <h6 class="text-muted mb-3">System Overview</h6>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Total Owners</span>
                    <strong>{{ \App\Models\Owner::count() }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Total Tenants</span>
                    <strong>{{ \App\Models\Tenant::count() }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Total Properties</span>
                    <strong>{{ \App\Models\Property::count() }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Total Receipts</span>
                    <strong>{{ \App\Models\RentReceipt::count() + \App\Models\MaintenanceReceipt::count() + \App\Models\ElectricityReceipt::count() }}</strong>
                </div>
            </div>
            @endif
        </div>
    </div>

    <div class="col-lg-8">
        {{-- Update Profile Info --}}
        <div class="card mb-4">
            <div class="card-header">
                <i class="bi bi-person me-2"></i>Profile Information
            </div>
            <div class="card-body">
                <form action="{{ route('profile.update-info') }}" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="name" class="form-label">Full Name</label>
                            <input type="text" name="name" id="name"
                                class="form-control @error('name') is-invalid @enderror"
                                value="{{ old('name', $user->name) }}">
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" name="email" id="email"
                                class="form-control @error('email') is-invalid @enderror"
                                value="{{ old('email', $user->email) }}">
                            @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <input type="text" class="form-control" value="{{ ucfirst($user->role) }}" disabled
                            style="background: #f8fafc;">
                        <small class="text-muted">Role cannot be changed from here.</small>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-check-circle me-1"></i> Save Changes
                    </button>
                </form>
            </div>
        </div>

        {{-- Change Password --}}
        <div class="card mb-4" id="change-password">
            <div class="card-header">
                <i class="bi bi-lock me-2"></i>Change Password
            </div>
            <div class="card-body">
                <form action="{{ route('profile.update-password') }}" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="mb-3">
                        <label for="current_password" class="form-label">Current Password</label>
                        <input type="password" name="current_password" id="current_password"
                            class="form-control @error('current_password') is-invalid @enderror"
                            placeholder="Enter your current password">
                        @error('current_password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="password" class="form-label">New Password</label>
                            <input type="password" name="password" id="password"
                                class="form-control @error('password') is-invalid @enderror"
                                placeholder="Min 8 characters">
                            @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="password_confirmation" class="form-label">Confirm New Password</label>
                            <input type="password" name="password_confirmation" id="password_confirmation"
                                class="form-control" placeholder="Repeat new password">
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-lock me-1"></i> Change Password
                    </button>
                </form>
            </div>
        </div>

        {{-- Danger Zone --}}
        @if(auth()->user()->isAdmin())
        <div class="card" style="border-color: #fca5a5;">
            <div class="card-header" style="background: #fee2e2; color: #991b1b;">
                <i class="bi bi-exclamation-triangle me-2"></i>Danger Zone
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Delete Account</strong>
                        <p class="text-muted small mb-0">Once deleted, all data will be permanently removed.</p>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" disabled title="Contact system administrator">
                        <i class="bi bi-trash me-1"></i> Delete Account
                    </button>
                </div>
            </div>
        </div>
        @endif
    </div>
</div>
@endsection
