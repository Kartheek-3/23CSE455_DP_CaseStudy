#pragma once
#include <map>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct Announcement {
    int id;
    std::string title;
    std::optional<std::string> userId;
    bool isActive = true;
};

struct Packed {
    Announcement announcement;
    std::optional<bool> read;
};

class EventPublisher {
public:
    virtual ~EventPublisher() = default;
    virtual void publishMainStream(const std::string& userId, const std::string& type) = 0;
    virtual void publishBroadcastStream(const std::string& type) = 0;
};

class ModerationLog {
public:
    virtual ~ModerationLog() = default;
    virtual void log(const std::string& moderator, const std::string& type) = 0;
};

class AnnouncementRepository {
public:
    void insert(const Announcement& announcement) { rows_[announcement.id] = announcement; }

    Announcement* find(int id) {
        auto it = rows_.find(id);
        return it == rows_.end() ? nullptr : &it->second;
    }

    std::vector<Announcement*> all() {
        std::vector<Announcement*> result;
        for (auto& [id, announcement] : rows_) result.push_back(&announcement);
        return result;
    }

    bool addRead(const std::string& userId, int id) { return reads_.insert({userId, id}).second; }

    bool hasRead(const std::string& userId, int id) const { return reads_.count({userId, id}) > 0; }

private:
    std::map<int, Announcement> rows_;
    std::set<std::pair<std::string, int>> reads_;
};

class AnnouncementService {
public:
    AnnouncementService(AnnouncementRepository& repository, EventPublisher& events, ModerationLog& moderationLog)
        : repository_(repository), events_(events), moderationLog_(moderationLog) {}

    Announcement create(const std::string& title, const std::optional<std::string>& userId,
                        const std::optional<std::string>& moderator) {
        Announcement announcement{nextId_++, title, userId};
        repository_.insert(announcement);
        if (userId) {
            events_.publishMainStream(*userId, "announcementCreated");
            if (moderator) moderationLog_.log(*moderator, "createUserAnnouncement");
        } else {
            events_.publishBroadcastStream("announcementCreated");
            if (moderator) moderationLog_.log(*moderator, "createGlobalAnnouncement");
        }
        return announcement;
    }

    std::vector<int> unread(const std::string& userId) {
        std::vector<int> result;
        for (Announcement* a : repository_.all()) {
            bool visible = !a->userId || *a->userId == userId;
            if (a->isActive && visible && !repository_.hasRead(userId, a->id)) result.push_back(a->id);
        }
        return result;
    }

    void read(const std::string& userId, int id) {
        if (!repository_.addRead(userId, id)) return;
        Announcement* announcement = repository_.find(id);
        if (announcement && announcement->userId && *announcement->userId == userId) announcement->isActive = false;
        if (unread(userId).empty()) events_.publishMainStream(userId, "readAllAnnouncements");
    }

    Packed get(int id, const std::optional<std::string>& me) {
        Announcement* announcement = repository_.find(id);
        if (!announcement || (announcement->userId && announcement->userId != me)) {
            throw std::runtime_error("not found");
        }
        std::optional<bool> read;
        if (me) read = repository_.hasRead(*me, id);
        return {*announcement, read};
    }

private:
    AnnouncementRepository& repository_;
    EventPublisher& events_;
    ModerationLog& moderationLog_;
    int nextId_ = 1;
};
