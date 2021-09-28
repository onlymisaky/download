type EventName = string | symbol;
type Listener = (...args: any[]) => void;

export class Events {

  events = new Map<EventName, Listener[]>();

  on(eventName: EventName, listener: Listener): this {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    const listeners = this.events.get(eventName) as Listener[];
    listeners.push(listener);
    return this;
  }

  emit(eventName: EventName, ...args: any[]): this {
    // 解决 once 的 bug
    const listeners = [...(this.events.get(eventName) || [])];
    listeners.forEach((listener) => {
      listener(...args);
    });
    return this;
  }

  off(eventName: EventName, listener?: Listener): this {
    if (typeof listener === 'function') {
      const listeners = this.events.get(eventName) || [];
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    } else {
      this.events.delete(eventName);
    }
    return this;
  }

  once(eventName: EventName, listener: Listener): this {
    const one = (...args: any) => {
      this.off(eventName, one);
      listener(...args);
    };
    return this.on(eventName, one);
  }
}
