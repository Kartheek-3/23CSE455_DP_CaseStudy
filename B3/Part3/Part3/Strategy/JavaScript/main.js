
class IsEmployer {
    hasPermission(user, job = null) {
        return user !== null && user !== undefined &&
            user.role === "employer";
    }
}

class IsEmployee {
    hasPermission(user, job = null) {
        return user !== null && user !== undefined &&
            user.role === "employee";
    }
}

class IsJobCreator {
    hasPermission(user, job = null) {
        return user !== null && user !== undefined &&
            job !== null && job !== undefined &&
            user.id === job.owner_id;
    }
}

function checkPermission(strategy, user, job = null) {
    return strategy.hasPermission(user, job);
}

if (require.main === module) {
    const employer = { id: 1, role: "employer" };
    const employee = { id: 2, role: "employee" };
    const job = { id: 101, owner_id: 1 };

    console.log("Employer permission:", checkPermission(new IsEmployer(), employer));
    console.log("Employee permission:", checkPermission(new IsEmployee(), employee));
    console.log("Job creator permission:", checkPermission(new IsJobCreator(), employer, job));
}

module.exports = { IsEmployer, IsEmployee, IsJobCreator, checkPermission };
