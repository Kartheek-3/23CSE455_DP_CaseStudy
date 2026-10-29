import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TestMain {
    static final Path ROOT = Path.of("../../common_specs");
    static List<String[]> read(String name) throws Exception {
        List<String[]> out = new ArrayList<>();
        for (String line : Files.readAllLines(ROOT.resolve(name))) out.add(line.split("\t", -1));
        return out;
    }
    static void equal(Object actual, Object expected) {
        if (!actual.equals(expected)) throw new AssertionError("actual=" + actual + " expected=" + expected);
    }
    static void error(String expected, Runnable action) {
        try { action.run(); } catch (AdapterError ex) { equal(ex.code, expected); return; }
        throw new AssertionError("Missing expected error " + expected);
    }
    static void isolation() {
        Path atlas = ROOT.resolve("atlas_raw.tsv"), beacon = ROOT.resolve("beacon_raw.tsv");
        Path badAtlas = ROOT.resolve("adapter_invalid_fixtures/atlas_invalid_price.tsv");
        Path badBeacon = ROOT.resolve("adapter_invalid_fixtures/beacon_invalid_type.tsv");
        Path brokenBeacon = ROOT.resolve("adapter_invalid_fixtures/beacon_missing_structure.tsv");
        BookingOfferClient client = new BookingOfferClient();
        error("INVALID_OFFER", () -> client.getOffer("atlas_demo","rome","atlas-rome-bad-price-01",badAtlas,beacon));
        error("INVALID_OFFER", () -> client.getOffer("beacon_demo","rome","beacon-rome-invalid-01",atlas,badBeacon));
        error("INVALID_FIXTURE", () -> client.getOffer("beacon_demo","rome","beacon-rome-incomplete-01",atlas,brokenBeacon));
        equal(client.getOffer("beacon_demo","rome","beacon-rome-museum-01",badAtlas,beacon).offerId,"beacon-rome-museum-01");
        equal(client.getOffer("atlas_demo","rome","atlas-rome-walk-01",atlas,badBeacon).offerId,"atlas-rome-walk-01");
        equal(new AtlasAdapter(atlas).offersFor("paris").size(),1);
        equal(new BeaconAdapter(beacon).offersFor("rome").size(),1);
        error("UNKNOWN_OFFER", () -> client.getOffer("atlas_demo","rome","beacon-rome-museum-01",atlas,beacon));
        error("UNKNOWN_OFFER", () -> client.getOffer("beacon_demo","rome","atlas-rome-walk-01",atlas,beacon));
    }
    public static void main(String[] args) throws Exception {
        List<String[]> cases = read("adapter_cases.tsv"), expected = read("adapter_expected.tsv");
        equal(cases.size(), 11); equal(expected.size(), 11);
        equal(Arrays.asList(cases.get(0)), Arrays.asList("case_id","provider_code","destination_code","offer_id","atlas_source","beacon_source"));
        for (int i=1; i<cases.size(); i++) {
            String[] row = cases.get(i);
            List<String> output = new ArrayList<>();
            output.add(row[0]);
            try {
                NormalizedOffer offer = new BookingOfferClient().getOffer(row[1],row[2],row[3],ROOT.resolve(row[4]),ROOT.resolve(row[5]));
                output.add("OK"); output.addAll(offer.fields());
            } catch (AdapterError ex) { output.add("ERROR"); output.add(ex.code); }
            equal(output, Arrays.asList(expected.get(i)));
            System.out.println(String.join("\t",output));
        }
        isolation();
        System.err.println("passed=10/10 failures=0 errors=0 skipped=0; extra_isolation_checks=passed");
    }
}
