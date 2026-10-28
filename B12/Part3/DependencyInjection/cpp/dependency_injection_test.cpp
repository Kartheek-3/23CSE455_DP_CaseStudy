// Tests for the Dependency Injection cross-language snippet (shared cases).

#include "notification_service.hpp"

#include <cstdlib>
#include <iostream>
#include <string>

static int passed = 0;
static int total = 0;

static void check(const char* label, const std::string& actual,
                  const std::string& expected) {
    total += 1;
    if (actual != expected) {
        std::cerr << label << ": expected " << expected
                  << " got " << actual << "\n";
        std::exit(1);
    }
    passed += 1;
}

static void check(const char* label, long long actual, long long expected) {
    total += 1;
    if (actual != expected) {
        std::cerr << label << ": expected " << expected
                  << " got " << actual << "\n";
        std::exit(1);
    }
    passed += 1;
}

int main() {
    EmailSender email;
    check("email-channel", email.channel(), std::string("email"));

    NotificationService emailService(&email);
    check("email-send", emailService.notify("hi"), std::string("email:hi"));

    SmsSender sms;
    check("sms-channel", sms.channel(), std::string("sms"));

    NotificationService smsService(&sms);
    check("sms-send", smsService.notify("hi"), std::string("sms:hi"));

    check("inject-different",
          emailService.notify("x") != smsService.notify("x") ? 1 : 0, 1);
    check("composition-root",
          buildNotificationService().notify("p"), std::string("email:p"));

    std::cout << "DEPENDENCY_INJECTION_CPP PASS " << passed << "/" << total
              << "\n";
    return 0;
}
