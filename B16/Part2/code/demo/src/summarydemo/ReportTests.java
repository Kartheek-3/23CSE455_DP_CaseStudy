package summarydemo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

// CH01 demo: one test of each outcome plus two slow tests.
class ReportTests {

	@Test
	void slowExport() throws Exception {
		Thread.sleep(250);
	}

	@Test
	void slowImport() throws Exception {
		Thread.sleep(120);
	}

	@Test
	void quickCheck() {
		assertTrue(true);
	}

	@Test
	void onlyOnCi() {
		Assumptions.assumeTrue(System.getenv("CI") != null, "not running on CI");
	}

	@Disabled("waiting for new report format")
	@Test
	void newFormat() {
	}
}
