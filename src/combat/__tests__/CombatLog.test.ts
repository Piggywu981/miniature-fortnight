import { CombatLog } from '../CombatLog';

describe('CombatLog', () => {
  let log: CombatLog;

  beforeEach(() => {
    log = new CombatLog();
  });

  describe('entry management', () => {
    it('should add entry', () => {
      const entry = {
        timestamp: Date.now(),
        type: 'attack' as const,
        message: 'Test attack'
      };
      log.addEntry(entry);
      expect(log.getEntries().length).toBe(1);
    });

    it('should get all entries', () => {
      log.logAttack('attacker1', 'defender1');
      log.logAttack('attacker2', 'defender2');
      const entries = log.getEntries();
      expect(entries.length).toBe(2);
    });

    it('should get entry count', () => {
      log.logAttack('attacker1', 'defender1');
      log.logAttack('attacker2', 'defender2');
      expect(log.getEntryCount()).toBe(2);
    });

    it('should clear entries', () => {
      log.logAttack('attacker1', 'defender1');
      log.clear();
      expect(log.getEntryCount()).toBe(0);
    });
  });

  describe('logging methods', () => {
    it('should log attack', () => {
      log.logAttack('attacker', 'defender');
      const entries = log.getEntries();
      expect(entries[0].type).toBe('attack');
      expect(entries[0].attackerId).toBe('attacker');
      expect(entries[0].defenderId).toBe('defender');
    });

    it('should log damage', () => {
      log.logDamage('attacker', 'defender', 10, true);
      const entries = log.getEntries();
      expect(entries[0].type).toBe('damage');
      expect(entries[0].damage).toBe(10);
      expect(entries[0].isCritical).toBe(true);
      expect(entries[0].message).toContain('CRITICAL');
    });

    it('should log heal', () => {
      log.logHeal('target', 20);
      const entries = log.getEntries();
      expect(entries[0].type).toBe('heal');
      expect(entries[0].damage).toBe(20);
      expect(entries[0].message).toContain('heals');
    });

    it('should log death', () => {
      log.logDeath('target');
      const entries = log.getEntries();
      expect(entries[0].type).toBe('death');
      expect(entries[0].message).toContain('defeated');
    });

    it('should log escape', () => {
      log.logEscape('attacker');
      const entries = log.getEntries();
      expect(entries[0].type).toBe('escape');
      expect(entries[0].message).toContain('escaped');
    });

    it('should log victory', () => {
      log.logVictory('winner');
      const entries = log.getEntries();
      expect(entries[0].type).toBe('victory');
      expect(entries[0].message).toContain('wins');
    });

    it('should log defeat', () => {
      log.logDefeat('loser');
      const entries = log.getEntries();
      expect(entries[0].type).toBe('defeat');
      expect(entries[0].message).toContain('defeated');
    });
  });

  describe('entry filtering', () => {
    beforeEach(() => {
      log.logAttack('attacker1', 'defender1');
      log.logDamage('attacker1', 'defender1', 10, false);
      log.logHeal('attacker1', 20);
      log.logDeath('defender1');
    });

    it('should get recent entries', () => {
      const recent = log.getRecentEntries(2);
      expect(recent.length).toBe(2);
      expect(recent[0].type).toBe('heal');
      expect(recent[1].type).toBe('death');
    });

    it('should get entries by type', () => {
      const damageEntries = log.getEntriesByType('damage');
      expect(damageEntries.length).toBe(1);
      expect(damageEntries[0].type).toBe('damage');
    });

    it('should get entries by participant', () => {
      const attackerEntries = log.getEntriesByParticipant('attacker1');
      expect(attackerEntries.length).toBe(3);
      expect(attackerEntries.every(e => e.attackerId === 'attacker1' || e.defenderId === 'attacker1')).toBe(true);
    });
  });

  describe('serialization', () => {
    it('should serialize log', () => {
      log.logAttack('attacker', 'defender');
      log.logDamage('attacker', 'defender', 10, true);
      const data = log.serialize();
      expect(data.length).toBe(2);
    });

    it('should deserialize log', () => {
      log.logAttack('attacker', 'defender');
      log.logDamage('attacker', 'defender', 10, true);
      const data = log.serialize();
      const deserialized = CombatLog.deserialize(data);
      expect(deserialized.getEntryCount()).toBe(log.getEntryCount());
    });
  });
});
