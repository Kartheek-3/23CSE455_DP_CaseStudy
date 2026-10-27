package summarydemo;

import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.TestPlan;

// Demo-only listener (registered via META-INF/services in this demo) that prints every callback,
// so the log shows when ClassSummaryListener receives the same events and when it writes its file.
public class OrderTracer implements TestExecutionListener {

	@Override
	public void testPlanExecutionStarted(TestPlan testPlan) {
		System.out.println("[trace] testPlanExecutionStarted");
	}

	@Override
	public void executionSkipped(TestIdentifier id, String reason) {
		System.out.println("[trace]   executionSkipped  " + id.getDisplayName() + " (" + reason + ")");
	}

	@Override
	public void executionStarted(TestIdentifier id) {
		System.out.println("[trace]   executionStarted  " + id.getDisplayName());
	}

	@Override
	public void executionFinished(TestIdentifier id, TestExecutionResult result) {
		System.out.println("[trace]   executionFinished " + id.getDisplayName() + " " + result.getStatus());
	}

	@Override
	public void testPlanExecutionFinished(TestPlan testPlan) {
		System.out.println("[trace] testPlanExecutionFinished");
	}
}
