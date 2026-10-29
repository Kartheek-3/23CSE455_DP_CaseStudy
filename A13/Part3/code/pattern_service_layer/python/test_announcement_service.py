import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from announcement_service import AnnouncementService, AnnouncementRepository


class Events:
    def __init__(self, out):
        self.out = out

    def publish_main_stream(self, user_id, event_type):
        self.out.append("event:main:%s %s" % (user_id, event_type))

    def publish_broadcast_stream(self, event_type):
        self.out.append("event:broadcast " + event_type)


class ModLog:
    def __init__(self, out):
        self.out = out

    def log(self, moderator, kind):
        self.out.append("modlog:" + kind)


def run(text):
    out, repo = [], AnnouncementRepository()
    service = AnnouncementService(repo, Events(out), ModLog(out))
    for command in text.split(";"):
        parts = command.split(" ", 3)
        if parts[0] == "create":
            start = len(out)
            user = None if parts[1] == "-" else parts[1]
            created = service.create(parts[3], user, "admin" if parts[2] == "mod" else None)
            out.insert(start, "created#%d" % created.id)
        elif parts[0] == "read":
            target = repo.find(int(parts[2]))
            was_active = target is not None and target.is_active
            service.read(parts[1], int(parts[2]))
            if was_active and not target.is_active:
                out.append("deactivated#%d" % target.id)
        elif parts[0] == "get":
            try:
                announcement, read = service.get(int(parts[1]), None if parts[2] == "-" else parts[2])
                out.append("announcement#%d title=%s" % (announcement.id, announcement.title) +
                           ("" if read is None else " read=" + str(read).lower()))
            except LookupError as e:
                out.append("ERR:" + str(e))
        elif parts[0] == "unread":
            ids = [str(a.id) for a in service.unread(parts[1])]
            out.append("unread:" + (",".join(ids) or "none"))
    return "~".join(out)

def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        cases = [l.rstrip("\n").split("|", 2) for l in f if l.strip() and not l.startswith("#")]
    passed = 0
    for name, text, expected in cases:
        got = run(text)
        ok = got == expected
        passed += ok
        print(("PASS " if ok else "FAIL ") + name + ("" if ok else ": expected [%s] got [%s]" % (expected, got)))
    print("passed %d/%d" % (passed, len(cases)))
    sys.exit(0 if passed == len(cases) else 1)


if __name__ == "__main__":
    main()
