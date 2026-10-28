
from abc import ABC, abstractmethod


class MutationPipeline(ABC):
    """Defines the fixed sequence of mutation processing steps."""

    def execute(self, data):
        validated = self.validate(data)
        result = self.perform_mutation(validated)
        return self.format_response(result)

    def validate(self, data):
        if not data or "name" not in data:
            raise ValueError("Missing required field: name")
        return data

    @abstractmethod
    def perform_mutation(self, data):
        pass

    def format_response(self, result):
        return {"success": True, "data": result}


class CreateJobMutation(MutationPipeline):
    def perform_mutation(self, data):
        return {
            "name": data["name"],
            "type": "job"
        }


class CreateCompanyMutation(MutationPipeline):
    def perform_mutation(self, data):
        return {
            "name": data["name"],
            "type": "company"
        }


if __name__ == "__main__":
    job = CreateJobMutation()
    company = CreateCompanyMutation()

    print(job.execute({"name": "Python Developer"}))
    print(company.execute({"name": "Example Company"}))
