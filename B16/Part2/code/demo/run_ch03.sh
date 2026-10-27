#!/bin/bash
# CH03 demo: same tests, official JUnit 6.1.3 vs JUnit with CH03 (b16-evolution 6f98fbf).
# Run from this folder:  ./run_ch03.sh   (writes ../../changes/Change3/demo_ch03.log)
# Needs: JAVA_HOME (JDK 17+), the two console jars below.
set -u
LIBS=${LIBS:-$HOME/Desktop/dp-work/libs}
OFFICIAL=$LIBS/junit-platform-console-standalone-6.1.3.jar
EVOLVED=$LIBS/junit-console-b16-ch03.jar
JAVA=${JAVA_HOME:?set JAVA_HOME}/bin/java
OUT=build/classes
LOG=../../changes/Change3/demo_ch03.log

rm -rf build && mkdir -p $OUT
"$JAVA_HOME/bin/javac" -d $OUT -cp "$OFFICIAL" src/demo/*.java || exit 1

run() { # title, jar, extra console args...
	local title=$1 jar=$2; shift 2
	echo "================================================================"
	echo "== $title"
	echo "== jar: $(basename "$jar")   args: $*"
	echo "================================================================"
	"$JAVA" -Djava.util.logging.config.file=logging.properties -jar "$jar" execute \
		--disable-banner --disable-ansi-colors --details=tree -cp $OUT --select-package demo "$@" 2>&1 \
		| grep -v "^[[:space:]]*$" | grep -vE "^[[:space:]]+(at |\.\.\.)" \
		| awk '/^Usage: junit execute/{skip=1; print "[console usage help omitted]"} !skip{print} /^https:\/\/docs.junit.org\/[0-9.]+\/$/{skip=0}'
	echo "== exit code: ${PIPESTATUS[0]}"
	echo
}

POLICY=junit.platform.filter.policy
{
	echo "CH03 demo run on $(date '+%Y-%m-%d %H:%M'), $("$JAVA" -version 2>&1 | head -1)"
	echo
	run "1 BEFORE: official 6.1.3 ignores the policy keys (all 4 tests run, 2 flaky fail)" "$OFFICIAL" \
		--config $POLICY.mode=exclude --config $POLICY.tags=flaky
	run "2 AFTER, no policy keys: identical to 1 (default mode is off)" "$EVOLVED"
	run "3 AFTER, mode=exclude tags=flaky: normal CI job, flaky tests removed before execution" "$EVOLVED" \
		--config $POLICY.mode=exclude --config $POLICY.tags=flaky
	run "4 AFTER, mode=only tags=flaky: quarantine job, same list, only flaky tests run" "$EVOLVED" \
		--config $POLICY.mode=only --config $POLICY.tags=flaky
	run "5 AFTER, policy only methods=.*#fast.* AND console --include-tag 'smoke | flaky': policy narrows, never re-includes" "$EVOLVED" \
		--config $POLICY.mode=only --config "$POLICY.methods=.*#fast.*" --include-tag "smoke | flaky"
	run "6 AFTER, failure handling: mode=bogus -> discovery fails, no test runs" "$EVOLVED" \
		--config $POLICY.mode=bogus
	run "7 AFTER, failure handling: mode=exclude with an invalid tag expression" "$EVOLVED" \
		--config $POLICY.mode=exclude --config "$POLICY.tags=flaky &"
	run "8 AFTER, failure handling: mode=only with no tags and no methods" "$EVOLVED" \
		--config $POLICY.mode=only
} > "$LOG"
echo "wrote $LOG"
