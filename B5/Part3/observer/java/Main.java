import java.util.ArrayList;
import java.util.List;

interface MailObserver {
    void onDelivered(MailMessage message);
}

final class MailMessage {
    final String messageId;
    final String subject;
    final String recipient;

    MailMessage(String messageId, String subject, String recipient) {
        this.messageId = messageId;
        this.subject = subject;
        this.recipient = recipient;
    }
}

final class MailLogger implements MailObserver {
    private final List<MailMessage> received = new ArrayList<>();

    @Override
    public void onDelivered(MailMessage message) {
        received.add(message);
    }

    List<MailMessage> received() {
        return List.copyOf(received);
    }
}

final class MailDeliveryPublisher {
    private final List<MailObserver> observers = new ArrayList<>();

    void register(MailObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }

    void unregister(MailObserver observer) {
        observers.remove(observer);
    }

    void deliver(MailMessage message, boolean delivered) {
        if (!delivered) {
            return;
        }
        if (message.recipient == null || message.recipient.isBlank()) {
            throw new IllegalArgumentException("INVALID_RECIPIENT");
        }
        for (MailObserver observer : List.copyOf(observers)) {
            observer.onDelivered(message);
        }
    }
}
