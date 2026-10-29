<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use App\Models\User;
use App\Http\Requests\StoreOwnerRequest;
use App\Http\Requests\UpdateOwnerRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class OwnerController extends Controller
{
    // ── LIST ALL OWNERS ──────────────────────────
    // Yii2: actionIndex() with ActiveDataProvider
    // Laravel: Eloquent query + paginate()

    public function index()
    {
        $owners = Owner::with('user')
            ->withCount('properties')  // Adds properties_count attribute
            ->latest()                 // ORDER BY created_at DESC
            ->paginate(10);            // Like Yii2's Pagination widget

        return view('owners.index', compact('owners'));
    }

    // ── SHOW CREATE FORM ─────────────────────────
    // In Yii2, actionCreate() handles both GET (show form) and POST (save)
    // In Laravel, these are SEPARATE methods: create() = show form, store() = save

    public function create()
    {
        return view('owners.create');
    }

    // ── SAVE NEW OWNER ───────────────────────────
    // StoreOwnerRequest auto-validates before this runs
    // In Yii2: if ($model->load(Yii::$app->request->post()) && $model->save())
    // In Laravel: validation happens in FormRequest, controller just saves

    public function store(StoreOwnerRequest $request)
    {
        DB::transaction(function () use ($request) {
            // Create user account for the owner
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'owner',
            ]);

            // Create owner profile linked to user
            Owner::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'phone' => $request->phone,
                'cnic' => $request->cnic,
                'address' => $request->address,
            ]);
        });

        return redirect()->route('owners.index')
                         ->with('success', 'Owner created successfully.');
    }

    // ── VIEW SINGLE OWNER ────────────────────────
    // Route Model Binding: Laravel auto-does Owner::findOrFail($id)
    // In Yii2: $model = Owner::findOne($id); if (!$model) throw new NotFoundHttpException;

    public function show(Owner $owner)
    {
        $owner->load('user', 'properties.tenant');
        return view('owners.show', compact('owner'));
    }

    // ── SHOW EDIT FORM ───────────────────────────
    public function edit(Owner $owner)
    {
        $owner->load('user');
        return view('owners.edit', compact('owner'));
    }

    // ── UPDATE OWNER ─────────────────────────────
    public function update(UpdateOwnerRequest $request, Owner $owner)
    {
        $owner->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'cnic' => $request->cnic,
            'address' => $request->address,
        ]);

        // Also update the linked user
        $owner->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->route('owners.index')
                         ->with('success', 'Owner updated successfully.');
    }

    // ── DELETE OWNER ─────────────────────────────
    public function destroy(Owner $owner)
    {
        // Deleting user cascades to owner (because of foreign key)
        $owner->user->delete();

        return redirect()->route('owners.index')
                         ->with('success', 'Owner deleted successfully.');
    }
}
