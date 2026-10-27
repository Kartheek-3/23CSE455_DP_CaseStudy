import sys

from template import InputFormatError, report


def main(argv):
    if len(argv) != 2:
        print("usage: python3 main.py <tests-file>", file=sys.stderr)
        return 2
    try:
        sys.stdout.write(report(argv[1]))
    except (OSError, InputFormatError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
