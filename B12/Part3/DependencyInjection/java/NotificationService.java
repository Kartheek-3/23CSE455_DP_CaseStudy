// Dependency Injection pattern -- constructor injection + composition root.
// Production snippet. Tests live in DependencyInjectionTest.java.

interface NotificationSender {
    String channel();

    String send(String message);
}

class EmailSender implements NotificationSender {
    @Override
    public String channel() {
        return "email";
    }

    @Override
    public String send(String message) {
        return "email:" + message;
    }
}

class SmsSender implements NotificationSender {
    @Override
    public String channel() {
        return "sms";
    }

    @Override
    public String send(String message) {
        return "sms:" + message;
    }
}

class NotificationService {
    private final NotificationSender sender;

    NotificationService(NotificationSender sender) {
        this.sender = sender;
    }

    String notifyUser(String message) {
        return sender.send(message);
    }

    static NotificationService build() {
        return new NotificationService(new EmailSender());
    }
}
