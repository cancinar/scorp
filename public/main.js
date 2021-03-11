// @ts-check
"use strict";
import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import {
  addMessage,
  animateGift,
  isPossiblyAnimatingGift,
  isAnimatingGiftUI,
} from "./dom_updates.js";

const api = new APIWrapper();
let interval = 0;
class EventQueue {
  queue;
  processingEvent;
  static priorities = new Map([
    ["ag", 1],
    ["m", 2],
    ["g", 3],
  ]);

  constructor() {
    this.queue = [];
    this.processingEvent = {};
  }

  add(items) {
    this.queue.push(...items);
    this.queue.sort(this.compare);
  }

  compare(a, b) {
    if (EventQueue.priorities.get(a.type) < EventQueue.priorities.get(b.type)) {
      return -1;
    }
    if (EventQueue.priorities.get(a.type) > EventQueue.priorities.get(b.type)) {
      return 1;
    }
    return 0;
  }

  getFirst() {
    return this.queue[0] === "undefined" ? {} : this.queue[0];
  }

  consume() {
    if (this.queue.length > 0) {
      this.processingEvent = this.getFirst();
      return this.queue.shift();
    }
    return {};
  }
}

const queue = new EventQueue();

function replay() {
  if (typeof queue.getFirst() === "undefined") {
    return;
  }

  let event =  queue.consume();
  document.getElementById(
    "animatedGift"
  ).innerHTML = event.data.gift_emoji;
  document.getElementById("messages").innerHTML = event.data.username + ' '+ event.data.message;

}

function init() {
  setInterval(() => {
    if (queue.processingEvent.type === "ag") {
      interval += 500;
      if (interval >= 2000) {
        interval = 0;
        replay();
      }
      return;
    }

    replay();
  }, 500);
}

init();

api.setEventHandler((events) => {
  queue.add(events);
});

// NOTE: UI helper methods from `dom_updates` are already imported above.
