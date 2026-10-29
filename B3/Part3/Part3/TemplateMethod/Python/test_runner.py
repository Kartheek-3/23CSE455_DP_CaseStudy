
from main import (
    MutationPipeline,
    CreateJobMutation,
    CreateCompanyMutation,
)


def test_job_mutation():
    mutation = CreateJobMutation()
    result = mutation.execute({"name": "Python Developer"})

    assert result["success"] is True
    assert result["data"]["name"] == "Python Developer"
    assert result["data"]["type"] == "job"
    print("PASS: Job mutation")


def test_company_mutation():
    mutation = CreateCompanyMutation()
    result = mutation.execute({"name": "Example Company"})

    assert result["success"] is True
    assert result["data"]["name"] == "Example Company"
    assert result["data"]["type"] == "company"
    print("PASS: Company mutation")


def test_validation():
    mutation = CreateJobMutation()

    try:
        mutation.execute({})
        assert False, "Expected ValueError"
    except ValueError:
        print("PASS: Validation rejects missing name")


if __name__ == "__main__":
    test_job_mutation()
    test_company_mutation()
    test_validation()
    print("All Template Method tests passed.")
