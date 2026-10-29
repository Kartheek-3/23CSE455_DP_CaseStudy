
class PermissionDeniedError extends Error {}

class MutationMixin {
    mutate(allowed, name) {
        try {
            this.checkPermissions(allowed);
            return this.resolveMutation(name);
        } catch (error) {
            if (error instanceof PermissionDeniedError) {
                return { success: false, error: error.message };
            }
            throw error;
        }
    }

    checkPermissions(allowed) {
        if (!allowed) {
            throw new PermissionDeniedError("Permission denied");
        }
    }

    resolveMutation(name) {
        throw new Error("Subclass must implement resolveMutation()");
    }
}

class CreateJobMutation extends MutationMixin {
    resolveMutation(name) {
        return { success: true, type: "job", name };
    }
}

class UpdateJobMutation extends MutationMixin {
    resolveMutation(name) {
        return { success: true, type: "updated_job", name };
    }
}

if (require.main === module) {
    console.log(new CreateJobMutation().mutate(true, "Developer"));
    console.log(new UpdateJobMutation().mutate(true, "Engineer"));
    console.log(new CreateJobMutation().mutate(false, "Denied"));
}

module.exports = { CreateJobMutation, UpdateJobMutation };
