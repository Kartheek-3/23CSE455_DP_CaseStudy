"""S2-N01: two incompatible local schemas behind one offer-provider contract."""
import csv
import re
from dataclasses import dataclass
from pathlib import Path


class AdapterError(ValueError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


@dataclass(frozen=True)
class NormalizedOffer:
    provider_code: str
    provider_name: str
    offer_id: str
    name: str
    kind: str
    address: str
    description: str
    sample_amount_cents: int
    currency: str

    def fields(self):
        return [self.provider_code, self.provider_name, self.offer_id, self.name, self.kind,
                self.address, self.description, str(self.sample_amount_cents), self.currency]


def read_tsv(path, header):
    with Path(path).open(encoding="utf-8", newline="") as handle:
        records = list(csv.reader(handle, delimiter="\t"))
    if not records or records[0] != header or any(len(r) != len(header) for r in records[1:]):
        raise AdapterError("INVALID_FIXTURE")
    return [dict(zip(header, row)) for row in records[1:]]


def cents(value):
    if not re.fullmatch(r"[0-9]+\.[0-9]{2}", value):
        raise AdapterError("INVALID_OFFER")
    major, minor = value.split(".")
    return int(major) * 100 + int(minor)


class OfferProvider:
    def offers_for(self, destination):
        raise NotImplementedError


class AtlasAdapter(OfferProvider):
    HEADER = ["destination", "id", "title", "category", "location", "details", "price"]
    KINDS = {"activity": "do", "shopping": "shop", "dining": "eat"}

    def __init__(self, source):
        self.source = source

    def offers_for(self, destination):
        rows = read_tsv(self.source, self.HEADER)
        result = []
        for row in rows:
            if row["destination"] != destination:
                continue
            currency_and_amount = row["price"].split(":")
            if (not all(row[key].strip() for key in ("id", "title", "location", "details"))
                    or row["category"] not in self.KINDS or len(currency_and_amount) != 2
                    or currency_and_amount[0] not in ("EUR", "GBP", "USD")):
                raise AdapterError("INVALID_OFFER")
            result.append(NormalizedOffer("atlas_demo", "Atlas Demo", row["id"], row["title"],
                           self.KINDS[row["category"]], row["location"], row["details"],
                           cents(currency_and_amount[1]), currency_and_amount[0]))
        return result


class BeaconAdapter(OfferProvider):
    HEADER = ["code", "label", "type", "address", "summary", "amount", "currency", "destination"]
    KINDS = {"experience": "do", "retail": "shop", "dining": "eat"}

    def __init__(self, source):
        self.source = source

    def offers_for(self, destination):
        rows = read_tsv(self.source, self.HEADER)
        result = []
        for row in rows:
            if row["destination"] != destination:
                continue
            if (not all(row[key].strip() for key in ("code", "label", "address", "summary"))
                    or row["type"] not in self.KINDS or row["currency"] not in ("EUR", "GBP", "USD")):
                raise AdapterError("INVALID_OFFER")
            result.append(NormalizedOffer("beacon_demo", "Beacon Demo", row["code"], row["label"],
                           self.KINDS[row["type"]], row["address"], row["summary"],
                           cents(row["amount"]), row["currency"]))
        return result


class ProviderRegistry:
    @staticmethod
    def find(code, atlas_source, beacon_source):
        if code == "atlas_demo":
            return AtlasAdapter(atlas_source)
        if code == "beacon_demo":
            return BeaconAdapter(beacon_source)
        raise AdapterError("UNKNOWN_PROVIDER")


class BookingOfferClient:
    def get_offer(self, provider_code, destination, offer_id, atlas_source, beacon_source):
        if provider_code not in ("atlas_demo", "beacon_demo"):
            raise AdapterError("UNKNOWN_PROVIDER")
        if destination not in ("rome", "paris"):
            raise AdapterError("UNKNOWN_DESTINATION")
        provider = ProviderRegistry.find(provider_code, atlas_source, beacon_source)
        for offer in provider.offers_for(destination):
            if offer.offer_id == offer_id:
                return offer
        raise AdapterError("UNKNOWN_OFFER")
