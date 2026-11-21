#!/usr/bin/env bash
# Run every VendOm frontend suite. Usage: bash frontend/tests/run_all.sh
cd "$(dirname "$0")/.." || exit 1
python3 build.py >/dev/null || exit 1
fail=0
for t in tauth t2 t3 t4 t5 t9 t10 t11 t12 t13 t14 t15 t16 t17 t18 t19 t20 t21 tconn; do
  [ -f "tests/$t.py" ] || continue
  out=$(timeout 600 python3 "tests/$t.py" 2>&1); rc=$?
  nf=$(grep -c '^FAIL' <<<"$out"); np=$(grep -c '^PASS' <<<"$out")
  if [ $rc -ne 0 ] || [ "$nf" -gt 0 ]; then fail=1; echo "FAIL $t  (pass $np, fail $nf, exit $rc)"; grep -E '^FAIL|Error' <<<"$out" | head -8 | sed 's/^/    /'
  else echo "ok   $t  ($np checks)"; fi
done
exit $fail
