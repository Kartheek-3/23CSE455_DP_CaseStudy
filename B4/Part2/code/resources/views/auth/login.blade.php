@extends('layouts.app')

@section('title', 'Login')

@section('content')
<div class="auth-wrapper">
    <div class="auth-card">
        <div class="auth-logo">
            <div class="mb-3">
                <span style="font-size: 2.5rem;"><i class="bi bi-building" style="color: #2563EB;"></i></span>
            </div>
            <h3>Welcome Back</h3>
            <p>Sign in to Property Manager</p>
        </div>

        <form method="POST" action="{{ route('login') }}">
            @csrf

            <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-envelope text-muted"></i></span>
                    <input id="email" type="email"
                           class="form-control @error('email') is-invalid @enderror"
                           name="email" value="{{ old('email') }}"
                           placeholder="you@example.com" required autofocus>
                </div>
                @error('email')
                    <div class="text-danger small mt-1">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-3">
                <div class="d-flex justify-content-between">
                    <label for="password" class="form-label">Password</label>
                    @if (Route::has('password.request'))
                        <a href="{{ route('password.request') }}" class="text-decoration-none small" style="color: var(--primary);">
                            Forgot password?
                        </a>
                    @endif
                </div>
                <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-lock text-muted"></i></span>
                    <input id="password" type="password"
                           class="form-control @error('password') is-invalid @enderror"
                           name="password" placeholder="••••••••" required>
                </div>
                @error('password')
                    <div class="text-danger small mt-1">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-4">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="remember"
                           id="remember" {{ old('remember') ? 'checked' : '' }}>
                    <label class="form-check-label small" for="remember">Remember me</label>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 mb-3">
                <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
            </button>

            {{-- Registration link hidden - accounts are created by admin --}}
        </form>
    </div>
</div>
@endsection
