import csv
import sys
from pathlib import Path
from main import AdapterError, BookingOfferClient, AtlasAdapter, BeaconAdapter

ROOT = Path(__file__).resolve().parents[2] / "common_specs"


def read(name):
    with (ROOT / name).open(encoding="utf-8", newline="") as f:
        return list(csv.reader(f, delimiter="\t"))


def result(row):
    case_id, provider, destination, offer_id, atlas, beacon = row
    try:
        offer = BookingOfferClient().get_offer(provider, destination, offer_id, ROOT / atlas, ROOT / beacon)
        return [case_id, "OK", *offer.fields()]
    except AdapterError as exc:
        return [case_id, "ERROR", exc.code]


def assert_isolation():
    valid_atlas = ROOT / "atlas_raw.tsv"
    valid_beacon = ROOT / "beacon_raw.tsv"
    bad_atlas = ROOT / "adapter_invalid_fixtures/atlas_invalid_price.tsv"
    bad_beacon = ROOT / "adapter_invalid_fixtures/beacon_invalid_type.tsv"
    broken_beacon = ROOT / "adapter_invalid_fixtures/beacon_missing_structure.tsv"
    client = BookingOfferClient()
    for invalid, provider, offer_id, expected in [
        (bad_atlas, "atlas_demo", "atlas-rome-bad-price-01", "INVALID_OFFER"),
        (bad_beacon, "beacon_demo", "beacon-rome-invalid-01", "INVALID_OFFER"),
        (broken_beacon, "beacon_demo", "beacon-rome-incomplete-01", "INVALID_FIXTURE"),
    ]:
        try:
            client.get_offer(provider, "rome", offer_id,
                             invalid if provider == "atlas_demo" else valid_atlas,
                             invalid if provider == "beacon_demo" else valid_beacon)
            raise AssertionError("Expected " + expected)
        except AdapterError as exc:
            assert exc.code == expected
    assert client.get_offer("beacon_demo", "rome", "beacon-rome-museum-01", bad_atlas, valid_beacon).offer_id == "beacon-rome-museum-01"
    assert client.get_offer("atlas_demo", "rome", "atlas-rome-walk-01", valid_atlas, bad_beacon).offer_id == "atlas-rome-walk-01"
    assert len(AtlasAdapter(valid_atlas).offers_for("paris")) == 1
    assert len(BeaconAdapter(valid_beacon).offers_for("rome")) == 1
    for provider, foreign in [("atlas_demo", "beacon-rome-museum-01"), ("beacon_demo", "atlas-rome-walk-01")]:
        try:
            client.get_offer(provider, "rome", foreign, valid_atlas, valid_beacon)
            raise AssertionError("Cross-provider offer incorrectly retrieved")
        except AdapterError as exc:
            assert exc.code == "UNKNOWN_OFFER"


def main():
    cases = read("adapter_cases.tsv")
    expected = read("adapter_expected.tsv")
    assert len(cases) == len(expected) == 11
    assert cases[0] == ["case_id", "provider_code", "destination_code", "offer_id", "atlas_source", "beacon_source"]
    for row, want in zip(cases[1:], expected[1:]):
        got = result(row)
        if got != want:
            print(f"FAIL {row[0]}: got={got!r} expected={want!r}", file=sys.stderr)
            return 1
        print("\t".join(got))
    assert_isolation()
    print("passed=10/10 failures=0 errors=0 skipped=0; extra_isolation_checks=passed", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
