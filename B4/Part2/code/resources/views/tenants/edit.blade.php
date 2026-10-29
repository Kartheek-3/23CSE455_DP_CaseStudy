@extends('layouts.app')

@section('title', 'Edit Tenant')

@section('content')
<div class="mb-4">
    <a href="{{ route('tenants.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Tenants
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-pencil me-2"></i>Edit Tenant: {{ $tenant->name }}</div>
            <div class="card-body">
                <form action="{{ route('tenants.update', $tenant) }}" method="POST">
                    @csrf
                    @method('PUT')

                    <h6 class="text-muted mb-3">Account Information</h6>

                    <div class="mb-3">
                        <label for="name" class="form-label">Full Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" id="name"
                            class="form-control @error('name') is-invalid @enderror"
                            value="{{ old('name', $tenant->name) }}">
                        @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                        <input type="email" name="email" id="email"
                            class="form-control @error('email') is-invalid @enderror"
                            value="{{ old('email', $tenant->user->email) }}">
                        @error('email')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Personal Details</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="phone" class="form-label">Phone <span class="text-danger">*</span></label>
                            <input type="text" name="phone" id="phone"
                                class="form-control @error('phone') is-invalid @enderror"
                                value="{{ old('phone', $tenant->phone) }}">
                            @error('phone')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cnic" class="form-label">CNIC</label>
                            <input type="text" name="cnic" id="cnic"
                                class="form-control @error('cnic') is-invalid @enderror"
                                value="{{ old('cnic', $tenant->cnic) }}">
                            @error('cnic')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea name="address" id="address" rows="2"
                            class="form-control @error('address') is-invalid @enderror">{{ old('address', $tenant->address) }}</textarea>
                        @error('address')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Update Tenant</button>
                        <a href="{{ route('tenants.index') }}" class="btn btn-light">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
