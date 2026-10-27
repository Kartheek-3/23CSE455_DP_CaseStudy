import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
public final class TestMain {
    public static void main(String[] args) throws Exception {
        Path common = Path.of("../../common_specs");
        List<String> caseLines = Files.readAllLines(common.resolve("strategy_cases.tsv"));
        List<String> expectedLines = Files.readAllLines(common.resolve("strategy_expected.tsv"));
        List<String> cases = caseLines.subList(1, caseLines.size());
        List<String> expected = expectedLines.subList(1, expectedLines.size());
        QuoteEvaluator evaluator = new QuoteEvaluator();
        int passed = 0;
        for (int i = 0; i < cases.size(); i++) {
            String[] row = cases.get(i).split("\t", -1);
            String actual = evaluator.evaluate(row[0], row[1], row[2], row[3], row[4]);
            System.out.println(actual);
            if (i < expected.size() && actual.equals(expected.get(i))) passed++;
            else System.err.println("FAIL " + row[0] + ": expected=" +
                (i < expected.size() ? expected.get(i) : "MISSING") + " actual=" + actual);
        }
        int failures = cases.size() - passed + Math.max(0, expected.size() - cases.size());
        System.err.printf("RESULT: passed=%d/%d failures=%d errors=0%n", passed, cases.size(), failures);
        if (failures != 0 || cases.size() != 15) System.exit(1);
    }
}
