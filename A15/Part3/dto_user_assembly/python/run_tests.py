import sys
from snippet import User, UserDto, UserAssembler


def execute(script):
    cmd, name, age, phone, address = script.split()
    asm = UserAssembler()
    if cmd == "toDto":
        return asm.to_dto(User(7, name, int(age), phone, address)).text()
    dto = UserDto(name, int(age), phone, address)
    if cmd == "toEntity":
        return asm.to_entity(dto).text()
    return asm.to_dto(asm.to_entity(dto)).text()


def main(path):
    passed = total = 0
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"):
            continue
        script, expected = line.split(" => ", 1)
        total += 1
        got = execute(script)
        if got == expected:
            passed += 1
            print("PASS case%d" % total)
        else:
            print("FAIL case%d expected=%s got=%s" % (total, expected, got))
    print("RESULT passed=%d total=%d" % (passed, total))
    sys.exit(0 if passed == total else 1)


main(sys.argv[1])
