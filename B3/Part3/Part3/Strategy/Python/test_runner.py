
from main import IsEmployer, IsEmployee, IsJobCreator, check_permission


employer = {"id": 1, "role": "employer"}
employee = {"id": 2, "role": "employee"}
other_employer = {"id": 3, "role": "employer"}
job = {"id": 101, "owner_id": 1}


def test_employer_permission():
    assert check_permission(IsEmployer(), employer) is True
    assert check_permission(IsEmployer(), employee) is False
    print("PASS: Employer permission")


def test_employee_permission():
    assert check_permission(IsEmployee(), employee) is True
    assert check_permission(IsEmployee(), employer) is False
    print("PASS: Employee permission")


def test_job_creator_permission():
    assert check_permission(IsJobCreator(), employer, job) is True
    assert check_permission(IsJobCreator(), other_employer, job) is False
    assert check_permission(IsJobCreator(), employer, None) is False
    print("PASS: Job creator permission")


if __name__ == "__main__":
    test_employer_permission()
    test_employee_permission()
    test_job_creator_permission()
    print("All Strategy tests passed.")
