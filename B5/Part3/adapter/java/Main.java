import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class AdapterError extends RuntimeException {
    final String code;
    AdapterError(String code) { super(code); this.code = code; }
}

class NormalizedOffer {
    final String providerCode, providerName, offerId, name, kind, address, description, currency;
    final long amountCents;
    NormalizedOffer(String code, String provider, String id, String name, String kind, String address,
                    String description, long cents, String currency) {
        this.providerCode = code; this.providerName = provider; this.offerId = id;
        this.name = name; this.kind = kind; this.address = address;
        this.description = description; this.amountCents = cents; this.currency = currency;
    }
    List<String> fields() {
        return Arrays.asList(providerCode, providerName, offerId, name, kind, address,
                             description, Long.toString(amountCents), currency);
    }
}

interface OfferProvider { List<NormalizedOffer> offersFor(String destination); }

class RawTable {
    static List<String[]> read(Path source, String[] header) {
        List<String> lines;
        try { lines = Files.readAllLines(source); }
        catch (IOException ex) { throw new AdapterError("INVALID_FIXTURE"); }
        if (lines.isEmpty() || !Arrays.equals(lines.get(0).split("\t", -1), header))
            throw new AdapterError("INVALID_FIXTURE");
        List<String[]> rows = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            String[] row = lines.get(i).split("\t", -1);
            if (row.length != header.length) throw new AdapterError("INVALID_FIXTURE");
            rows.add(row);
        }
        return rows;
    }
    static long cents(String amount) {
        if (!amount.matches("[0-9]+\\.[0-9]{2}")) throw new AdapterError("INVALID_OFFER");
        try {
            String[] parts = amount.split("\\.");
            return Math.addExact(Math.multiplyExact(Long.parseLong(parts[0]), 100), Long.parseLong(parts[1]));
        } catch (ArithmeticException | NumberFormatException ex) {
            throw new AdapterError("INVALID_OFFER");
        }
    }
    static boolean currency(String value) { return value.equals("EUR") || value.equals("GBP") || value.equals("USD"); }
    static boolean present(String value) { return !value.trim().isEmpty(); }
}

class AtlasAdapter implements OfferProvider {
    private final Path source;
    AtlasAdapter(Path source) { this.source = source; }
    public List<NormalizedOffer> offersFor(String destination) {
        String[] header = {"destination","id","title","category","location","details","price"};
        List<NormalizedOffer> offers = new ArrayList<>();
        for (String[] r : RawTable.read(source, header)) {
            if (!r[0].equals(destination)) continue;
            String kind;
            switch (r[3]) {
                case "activity": kind = "do"; break;
                case "shopping": kind = "shop"; break;
                case "dining": kind = "eat"; break;
                default: throw new AdapterError("INVALID_OFFER");
            }
            String[] price = r[6].split(":", -1);
            if (!RawTable.present(r[1]) || !RawTable.present(r[2]) || !RawTable.present(r[4]) ||
                !RawTable.present(r[5]) || price.length != 2 || !RawTable.currency(price[0]))
                throw new AdapterError("INVALID_OFFER");
            offers.add(new NormalizedOffer("atlas_demo", "Atlas Demo", r[1], r[2], kind, r[4],
                                           r[5], RawTable.cents(price[1]), price[0]));
        }
        return offers;
    }
}

class BeaconAdapter implements OfferProvider {
    private final Path source;
    BeaconAdapter(Path source) { this.source = source; }
    public List<NormalizedOffer> offersFor(String destination) {
        String[] header = {"code","label","type","address","summary","amount","currency","destination"};
        List<NormalizedOffer> offers = new ArrayList<>();
        for (String[] r : RawTable.read(source, header)) {
            if (!r[7].equals(destination)) continue;
            String kind;
            switch (r[2]) {
                case "experience": kind = "do"; break;
                case "retail": kind = "shop"; break;
                case "dining": kind = "eat"; break;
                default: throw new AdapterError("INVALID_OFFER");
            }
            if (!RawTable.present(r[0]) || !RawTable.present(r[1]) || !RawTable.present(r[3]) ||
                !RawTable.present(r[4]) || !RawTable.currency(r[6])) throw new AdapterError("INVALID_OFFER");
            offers.add(new NormalizedOffer("beacon_demo", "Beacon Demo", r[0], r[1], kind, r[3],
                                           r[4], RawTable.cents(r[5]), r[6]));
        }
        return offers;
    }
}

class ProviderRegistry {
    static OfferProvider find(String code, Path atlas, Path beacon) {
        switch (code) {
            case "atlas_demo": return new AtlasAdapter(atlas);
            case "beacon_demo": return new BeaconAdapter(beacon);
            default: throw new AdapterError("UNKNOWN_PROVIDER");
        }
    }
}

class BookingOfferClient {
    NormalizedOffer getOffer(String code, String destination, String offerId, Path atlas, Path beacon) {
        if (!code.equals("atlas_demo") && !code.equals("beacon_demo")) throw new AdapterError("UNKNOWN_PROVIDER");
        if (!destination.equals("rome") && !destination.equals("paris")) throw new AdapterError("UNKNOWN_DESTINATION");
        OfferProvider selected = ProviderRegistry.find(code, atlas, beacon);
        for (NormalizedOffer offer : selected.offersFor(destination)) {
            if (offer.offerId.equals(offerId)) return offer;
        }
        throw new AdapterError("UNKNOWN_OFFER");
    }
}
