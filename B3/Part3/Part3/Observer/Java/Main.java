
import java.util.ArrayList;
import java.util.List;

interface JobObserver {
    void onJobCreated(String jobTitle);
}

class EmailNotifier implements JobObserver {
    @Override
    public void onJobCreated(String jobTitle) {
        System.out.println("Email notification: " + jobTitle);
    }
}

class AnalyticsTracker implements JobObserver {
    @Override
    public void onJobCreated(String jobTitle) {
        System.out.println("Analytics recorded: " + jobTitle);
    }
}

class JobService {
    private final List<JobObserver> observers = new ArrayList<>();

    public void addObserver(JobObserver observer) {
        observers.add(observer);
    }

    public void createJob(String jobTitle) {
        System.out.println("Job created: " + jobTitle);
        notifyObservers(jobTitle);
    }

    public void notifyObservers(String jobTitle) {
        for (JobObserver observer : observers) {
            observer.onJobCreated(jobTitle);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        JobService service = new JobService();
        service.addObserver(new EmailNotifier());
        service.addObserver(new AnalyticsTracker());
        service.createJob("Python Developer");
    }
}
