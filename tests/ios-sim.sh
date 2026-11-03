#!/usr/bin/env bash
# Rulează testele în Safari din simulatorul iOS (macOS). Folosire: tests/ios-sim.sh
set -uo pipefail
cd "$(dirname "$0")"
mkdir -p results
node serve.js 8765 & SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 2
read -r UDID NAME RT < <(python3 - <<'PY'
import json,subprocess
rt=json.loads(subprocess.check_output(['xcrun','simctl','list','runtimes','-j']))['runtimes']
rt=[r for r in rt if r.get('isAvailable') and r['identifier'].split('.')[-1].startswith('iOS')]
rt.sort(key=lambda r:[int(x) for x in r['version'].split('.')])
r=rt[-1]
dev=json.loads(subprocess.check_output(['xcrun','simctl','list','devices','available','-j']))['devices'][r['identifier']]
ph=[d for d in dev if d['name'].startswith('iPhone')]
d=([x for x in ph if 'Pro' not in x['name'] and 'Plus' not in x['name'] and 'Max' not in x['name'] and 'SE' not in x['name']] or ph)[-1]
print(d['udid'],d['name'].replace(' ','_'),r['version'])
PY
)
echo "Simulator: $NAME iOS $RT ($UDID)"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
sleep 5
LABEL="ios-${RT}"
xcrun simctl openurl "$UDID" "http://localhost:8765/__runner.html?name=${LABEL}&skipocr=1"
node wait-report.js "$LABEL" 1200
RC=$?
xcrun simctl io "$UDID" screenshot "results/${LABEL}.png" || true
xcrun simctl shutdown "$UDID" || true
exit $RC
