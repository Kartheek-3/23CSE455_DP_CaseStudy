#!/bin/bash
# CH02 demo: @ManagedResource with a real resource (JDK HttpServer), official JUnit 6.1.3 vs
# JUnit with CH01+CH02+CH03 (b16-evolution 99987b0).
# Run from this folder:  ./run_ch02.sh   (writes ../../changes/Change2/demo_ch02.log)
# Needs: JAVA_HOME (JDK 17+), the two console jars below.
set -u
LIBS=${LIBS:-$HOME/Desktop/dp-work/libs}
OFFICIAL=$LIBS/junit-platform-console-standalone-6.1.3.jar
EVOLVED=$LIBS/junit-console-b16-ch02.jar
JAVA=${JAVA_HOME:?set JAVA_HOME}/bin/java
OUT=build/ch02/classes
LOG=../../changes/Change2/demo_ch02.log

rm -rf build/ch02 && mkdir -p $OUT

run() { # number, title, extra console args...
	local n=$1 title=$2; shift 2
	echo "================================================================"
	echo "== $n $title"
	echo "== jar: $(basename "$EVOLVED")   args: $*"
	echo "================================================================"
	"$JAVA" -jar "$EVOLVED" execute --disable-banner --disable-ansi-colors --details=tree -cp $OUT "$@" 2>&1 \
		| grep -v "^[[:space:]]*$" | grep -vE "^[[:space:]]+(at |\.\.\.)|JUnit (Vintage|Platform Suite)" \
		| grep -vE "^\[ +0 "
	echo "== exit code: ${PIPESTATUS[0]}"
	echo
}

{
	echo "CH02 demo run on $(date '+%Y-%m-%d %H:%M'), $("$JAVA" -version 2>&1 | head -1)"
	echo "[demo] lines are printed by the demo tests and by the resource factory; the tree is printed by the console launcher."
	echo
	echo "================================================================"
	echo "== 1 BEFORE: the same tests compiled against official 6.1.3 - the feature does not exist"
	echo "================================================================"
	"$JAVA_HOME/bin/javac" -d build/ch02/official -cp "$OFFICIAL" src/resourcedemo/*.java > build/ch02/javac_official.txt 2>&1
	echo "== javac exit code: $?"
	grep -E "^[0-9]+ errors?" build/ch02/javac_official.txt
	echo "== missing symbols (count, symbol):"
	grep -E "symbol: +(class|interface)" build/ch02/javac_official.txt | sed -E 's/^ +//; s/ +/ /g' | sort | uniq -c
	echo
	"$JAVA_HOME/bin/javac" -d $OUT -cp "$EVOLVED" src/resourcedemo/*.java || exit 1
	run 2 "AFTER, class scope: requested in @BeforeAll, shared by both tests, destroyed after @AfterAll" \
		--select-class resourcedemo.SharedServerTests
	run 3 "AFTER, test scope: one server per test, shared with @BeforeEach, destroyed after @AfterEach even when the test fails" \
		--select-class resourcedemo.PerTestServerTests
	run 4 "AFTER, failure handling: create() throws -> ParameterResolutionException; destroy() throws -> the owning test fails" \
		--select-class resourcedemo.BrokenFactoryTests
	run 5 "AFTER, closing of stored AutoCloseables disabled: servers are still destroyed (CloseableResource fallback)" \
		--select-class resourcedemo.PerTestServerTests \
		--config junit.jupiter.extensions.store.close.autocloseable.enabled=false
} > "$LOG"
echo "wrote $LOG"
