#!/bin/bash
# CH01 demo: official JUnit 6.1.3 vs JUnit with CH01+CH03 (b16-evolution e55fefe).
# Run from this folder:  ./run_ch01.sh   (writes ../../changes/Change1/demo_ch01.log)
# Needs: JAVA_HOME (JDK 17+), the two console jars below.
set -u
LIBS=${LIBS:-$HOME/Desktop/dp-work/libs}
OFFICIAL=$LIBS/junit-platform-console-standalone-6.1.3.jar
EVOLVED=$LIBS/junit-console-b16-ch01.jar
JAVA=${JAVA_HOME:?set JAVA_HOME}/bin/java
TESTS=build/ch01/tests
TRACER=build/ch01/tracer
REPORTS=build/ch01/reports
LOG=../../changes/Change1/demo_ch01.log

rm -rf build/ch01 && mkdir -p $TESTS $TRACER $REPORTS
"$JAVA_HOME/bin/javac" -d $TESTS -cp "$OFFICIAL" src/demo/*.java src/summarydemo/ReportTests.java || exit 1
"$JAVA_HOME/bin/javac" -d $TRACER -cp "$OFFICIAL" src/summarydemo/OrderTracer.java || exit 1
cp -R resources/META-INF $TRACER/

run() { # number, title, jar, extra console args...
	local n=$1 title=$2 jar=$3; shift 3
	local dir=$REPORTS/$n
	echo "================================================================"
	echo "== $n $title"
	echo "== jar: $(basename "$jar")   ${JVM_OPT:+jvm: $JVM_OPT   }args: $*"
	echo "================================================================"
	"$JAVA" ${JVM_OPT:+"$JVM_OPT"} -Djava.util.logging.config.file=logging.properties -jar "$jar" execute \
		--disable-banner --disable-ansi-colors --details=none -cp $TESTS \
		--select-package demo --select-package summarydemo \
		--config junit.platform.reporting.output.dir=$dir "$@" 2>&1 \
		| grep -v "^[[:space:]]*$" | grep -vE "^[[:space:]]+(at |\.\.\.|=>|MethodSource|JUnit Jupiter:)" \
		| grep -vE "^\[ +0 " | sed "s#$PWD/##g"
	echo "== exit code: ${PIPESTATUS[0]}"
	if [ -f "$dir/junit-class-summary.txt" ]; then
		echo "== $dir/junit-class-summary.txt:"
		cat "$dir/junit-class-summary.txt"
	else
		echo "== no summary file in $dir"
	fi
	echo
}

S=junit.platform.listeners.summary
{
	echo "CH01 demo run on $(date '+%Y-%m-%d %H:%M'), $("$JAVA" -version 2>&1 | head -1)"
	echo "Tests: demo.CheckoutTests (2 pass, 1 flaky fails), demo.InventoryTests (1 flaky fails),"
	echo "summarydemo.ReportTests (3 pass incl. 2 slow, 1 aborted by assumption, 1 @Disabled)"
	echo
	run 1 "BEFORE: official 6.1.3 does not know the summary keys" "$OFFICIAL" --config $S.enabled=true
	run 2 "AFTER, no keys: listener is registered but disabled by default" "$EVOLVED"
	run 3 "AFTER, enabled, slowest=3, with demo OrderTracer: callback order and the summary file" "$EVOLVED" \
		-cp $TRACER --config $S.enabled=true --config $S.slowest=3
	run 4 "AFTER, enabled + CH03 policy exclude tags=flaky: filtered tests are absent, not skipped" "$EVOLVED" \
		--config $S.enabled=true --config junit.platform.filter.policy.mode=exclude \
		--config junit.platform.filter.policy.tags=flaky
	run 5 "AFTER, failure handling: slowest=abc -> warning, default 5 used, run unaffected" "$EVOLVED" \
		--config $S.enabled=true --config $S.slowest=abc
	run 6 "AFTER, failure handling: output file in a missing directory -> error logged, run unaffected" "$EVOLVED" \
		--config $S.enabled=true --config $S.output.file=missing-dir/summary.txt
	JVM_OPT="-Djunit.platform.execution.listeners.deactivate=*ClassSummaryListener" \
		run 7 "AFTER, switched off with the standard deactivate key (JVM system property; as a --config request parameter it has no effect because listeners are loaded before the request)" "$EVOLVED" \
		--config $S.enabled=true
} > "$LOG"
echo "wrote $LOG"
