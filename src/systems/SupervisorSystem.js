export default class SupervisorSystem {
  constructor(rules = []) {
    this.rules = [];
    this.setRules(rules);
    this.cooldowns = new Map(); // ruleId -> ms remaining
    this.messages = [];
    this.messageDurationMs = 4000;
    this.messageCounter = 0;
  }

  update(deltaSeconds, metrics) {
    const deltaMs = deltaSeconds * 1000;
    this.tickCooldowns(deltaMs);
    this.tickMessages(deltaMs);
    this.rules.forEach((rule) => {
      if (!rule.enabled) return;
      if (!this.canTrigger(rule.id)) return;
      const value = metrics?.[rule.metric];
      if (value == null) return;
      const ok = this.compare(value, rule.threshold, rule.comparison);
      if (ok) {
        this.trigger(rule);
      }
    });
  }

  compare(value, threshold, comparison) {
    switch (comparison) {
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      case '===':
        return value === threshold;
      default:
        return false;
    }
  }

  trigger(rule) {
    this.cooldowns.set(rule.id, rule.cooldownMs);
    this.messages.push({
      id: `${rule.id}-${++this.messageCounter}`,
      text: rule.message,
      ttlMs: this.messageDurationMs,
    });
    console.info(`[Supervisor] ${rule.message}`);
  }

  tickCooldowns(deltaMs) {
    for (const [ruleId, remaining] of this.cooldowns.entries()) {
      const next = remaining - deltaMs;
      if (next <= 0) {
        this.cooldowns.delete(ruleId);
      } else {
        this.cooldowns.set(ruleId, next);
      }
    }
  }

  tickMessages(deltaMs) {
    this.messages.forEach((m) => {
      m.ttlMs -= deltaMs;
    });
    this.messages = this.messages.filter((m) => m.ttlMs > 0);
  }

  canTrigger(ruleId) {
    return !this.cooldowns.has(ruleId);
  }

  setRules(rules = []) {
    this.rules = (rules ?? []).map((r) => ({ ...r }));
  }
}
