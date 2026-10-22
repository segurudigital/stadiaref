// CI runs locally first: the gates in .github/workflows/ci.yml, on this
// machine, in its order, stopping at the first failure. GitHub Actions is the
// backstop, not where a change is first checked.
//   npm run ci:local                    every gate (integration and WordPress need the network the first time)
//   npm run ci:local -- --quick         build, unit tests and the size budget only
//   npm run ci:local -- --from <step>   start at a step, after fixing it
//   npm run ci:local -- --list          the steps, in order
// The secret scan over the Git history runs only in CI.
import { spawnSync } from 'node:child_process';

// [name, command, in --quick]. Keep in step with ci.yml.
const steps = [
  ['install', 'npm ci', false],
  ['build', 'npm run build', true],
  ['unit', 'npm run test:unit', true],
  ['browser', 'npm run test:browser', false],
  ['size', 'npm run size', true],
  ['integration', 'npm run test:integration', false],
  ['wordpress', 'npm run test:wordpress', false],
  ['audit', 'npm audit --audit-level=moderate', false],
];

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const fromAt = args.indexOf('--from');
const from = fromAt === -1 ? null : args[fromAt + 1];
const names = steps.map(([n]) => n);
if (args.includes('--list')) {
  console.log(steps.map(([n, , q]) => (q ? n : `${n} (not in --quick)`)).join('\n'));
  process.exit(0);
}
if (fromAt !== -1 && !names.includes(from)) {
  console.error(`ci:local: --from takes one of: ${names.join(', ')}`);
  process.exit(2);
}

const start = Date.now();
for (const [name, cmd, inQuick] of steps.slice(from ? names.indexOf(from) : 0)) {
  if (quick && !inQuick) continue;
  console.log(`\n── ${name}: ${cmd}`);
  const t = Date.now();
  const r = spawnSync(cmd, { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error(`\nci:local: ${name} failed. Fix it, then: npm run ci:local -- --from ${name}${quick ? ' --quick' : ''}`);
    process.exit(1);
  }
  console.log(`   ok (${Math.round((Date.now() - t) / 1000)}s)`);
}
console.log(`\nci:local: every gate passed${quick ? ' (quick)' : ''}, ${Math.round((Date.now() - start) / 1000)}s.`);
