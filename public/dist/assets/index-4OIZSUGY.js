var te = Object.defineProperty;
var ae = (t, e, a) =>
  e in t
    ? te(t, e, { enumerable: !0, configurable: !0, writable: !0, value: a })
    : (t[e] = a);
var g = (t, e, a) => (ae(t, typeof e != "symbol" ? e + "" : e, a), a);
(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const o of s)
      if (o.type === "childList")
        for (const i of o.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && n(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function a(s) {
    const o = {};
    return (
      s.integrity && (o.integrity = s.integrity),
      s.referrerPolicy && (o.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (o.credentials = "include")
        : s.crossOrigin === "anonymous"
        ? (o.credentials = "omit")
        : (o.credentials = "same-origin"),
      o
    );
  }
  function n(s) {
    if (s.ep) return;
    s.ep = !0;
    const o = a(s);
    fetch(s.href, o);
  }
})();
let I = Object,
  b,
  h = I.getPrototypeOf,
  E = document,
  O,
  m,
  y,
  R = { isConnected: 1 },
  se = 1e3,
  C,
  V = {},
  ne = h(R),
  G = h(h),
  A = (t, e, a, n) => (t ?? (setTimeout(a, n), new Set())).add(e),
  H = (t, e, a) => {
    let n = m;
    m = e;
    try {
      return t(a);
    } catch (s) {
      return console.error(s), a;
    } finally {
      m = n;
    }
  },
  k = (t) =>
    t.filter((e) => {
      var a;
      return (a = e._dom) == null ? void 0 : a.isConnected;
    }),
  U = (t) =>
    (C = A(
      C,
      t,
      () => {
        for (let e of C)
          (e._bindings = k(e._bindings)), (e._listeners = k(e._listeners));
        C = b;
      },
      se
    )),
  N = {
    get val() {
      return m == null || m.add(this), this._val;
    },
    get oldVal() {
      return m == null || m.add(this), this._oldVal;
    },
    set val(t) {
      let e = this;
      if (t !== e._val) {
        e._val = t;
        let a = [...(e._listeners = k(e._listeners))];
        for (let n of a) F(n.f, n.s, n._dom), (n._dom = b);
        e._bindings.length ? (O = A(O, e, ie)) : (e._oldVal = t);
      }
    },
  },
  q = (t) => ({
    __proto__: N,
    _val: t,
    _oldVal: t,
    _bindings: [],
    _listeners: [],
  }),
  z = (t) => h(t ?? 0) === N,
  oe = (t) => (z(t) ? t.val : t),
  le = (t) => (z(t) ? t.oldVal : t),
  S = (t, e) => {
    let a = new Set(),
      n = { f: t },
      s = y;
    y = [];
    let o = H(t, a, e);
    o = (o ?? E).nodeType ? o : new Text(o);
    for (let i of a) U(i), i._bindings.push(n);
    for (let i of y) i._dom = o;
    return (y = s), (n._dom = o);
  },
  F = (t, e = q(), a) => {
    let n = new Set(),
      s = { f: t, s: e };
    (s._dom = a ?? (y == null ? void 0 : y.push(s)) ?? R), (e.val = H(t, n));
    for (let o of n) U(o), o._listeners.push(s);
    return e;
  },
  X = (t, ...e) => {
    for (let a of e.flat(1 / 0)) {
      let n = h(a ?? 0),
        s = n === N ? S(() => a.val) : n === G ? S(a) : a;
      s != b && t.append(s);
    }
    return t;
  },
  re = (t) => ((t._isBindingFunc = 1), t),
  W = (t) =>
    new Proxy(
      (e, ...a) => {
        var i;
        let [n, ...s] = h(a[0] ?? 0) === ne ? a : [{}, ...a],
          o = t ? E.createElementNS(t, e) : E.createElement(e);
        for (let [c, l] of I.entries(n)) {
          let d = (P) => (P ? I.getOwnPropertyDescriptor(P, c) ?? d(h(P)) : b),
            w = e + "," + c,
            p = V[w] ?? (V[w] = ((i = d(h(o))) == null ? void 0 : i.set) ?? 0),
            M = p ? p.bind(o) : o.setAttribute.bind(o, c),
            D = h(l ?? 0);
          D === N
            ? S(() => (M(l.val), o))
            : D === G && (!c.startsWith("on") || l._isBindingFunc)
            ? S(() => (M(l()), o))
            : M(l);
        }
        return X(o, ...s);
      },
      { get: (e, a) => e.bind(b, a) }
    ),
  J = (t, e) => (e ? e !== t && t.replaceWith(e) : t.remove()),
  ie = () => {
    let t = [...O].filter((e) => e._val !== e._oldVal);
    O = b;
    for (let e of new Set(t.flatMap((a) => (a._bindings = k(a._bindings)))))
      J(e._dom, S(e.f, e._dom)), (e._dom = b);
    for (let e of t) e._oldVal = e._val;
  },
  ce = (t, e) => J(t, S(e, t));
const r = {
  add: X,
  _: re,
  tags: W(),
  tagsNS: W,
  state: q,
  val: oe,
  oldVal: le,
  derive: F,
  hydrate: ce,
};
let T;
const de = () => (T = []),
  ue = () => (T = null),
  f = (t, e) => {
    if (!t) {
      if (T) T.push(e);
      else throw new Error(e);
      return !1;
    }
    return !0;
  },
  j = Object.getPrototypeOf,
  fe = j(r.state()),
  B = (t) => j(t ?? 0) === fe,
  x = (t) => (
    f(!B(t), "State couldn't have value to other state"),
    f(!(t instanceof Node), "DOM Node is not valid value for state"),
    t
  ),
  pe = (t) =>
    new Proxy(r.state(x(t)), {
      set: (e, a, n) => (a === "val" && x(n), Reflect.set(e, a, n)),
    }),
  ge = (t) => (
    f(typeof t == "function", "Must pass-in a function to `van.derive`"),
    r.derive(t)
  ),
  K = (t) =>
    typeof t == "string" ||
    typeof t == "number" ||
    typeof t == "boolean" ||
    typeof t == "bigint",
  me = (t) => t instanceof Node || K(t),
  Y = (t) => (
    f(
      me(t) || t === null || t === void 0,
      "Only DOM Node, string, number, boolean, bigint, null, undefined are valid child of a DOM Element"
    ),
    t
  ),
  $ = (t) => (e) => {
    const a = Y(t(e));
    return (
      a !== e &&
        a instanceof Node &&
        f(
          !a.isConnected,
          "If the result of complex binding function is not the same as previous one, it shouldn't be already connected to document"
        ),
      a
    );
  },
  Z = (t) =>
    t
      .flat(1 / 0)
      .map((e) =>
        B(e)
          ? $(() => e.val)
          : typeof e == "function"
          ? $(e)
          : (f(
              !(e != null && e.isConnected),
              "You can't add a DOM Node that is already connected to document"
            ),
            Y(e))
      ),
  he = (t, ...e) => (
    f(
      t instanceof Element,
      "1st argument of `van.add` function must be a DOM Element object"
    ),
    r.add(t, ...Z(e))
  ),
  ve = (t) => (
    f(typeof t == "function", "Must pass-in a function to `van._`"), r._(t)
  ),
  Q = (t) =>
    new Proxy(r.tagsNS(t), {
      get: (e, a) => {
        const n = e[a];
        return (...s) => {
          const [o, ...i] = j(s[0] ?? 0) === Object.prototype ? s : [{}, ...s],
            c = {};
          for (const [l, d] of Object.entries(o)) {
            const w = l.startsWith("on")
              ? l.toLowerCase() === l
                ? (p) => (
                    f(
                      typeof p == "function" || p === null,
                      `Invalid property value for ${l}: Only functions and null are allowed for ${l} property`
                    ),
                    p
                  )
                : (p) => (
                    f(
                      typeof p == "string",
                      `Invalid property value for ${l}: Only strings are allowed for ${l} attribute`
                    ),
                    p
                  )
              : (p) => (
                  f(
                    K(p) || p === null,
                    `Invalid property value for ${l}: Only string, number, boolean, bigint and null are valid prop value types`
                  ),
                  p
                );
            B(d)
              ? (c[l] = r._(() => w(d.val)))
              : typeof d == "function" &&
                (!l.startsWith("on") || d._isBindingFunc)
              ? (c[l] = r._(() => w(d())))
              : (c[l] = w(d));
          }
          return n(c, ...Z(i));
        };
      },
    }),
  ye = (t) => (
    f(
      typeof t == "string",
      "Must provide a string for parameter `ns` in `van.tagsNS`"
    ),
    Q(t)
  ),
  be = (t, e) => (
    f(
      t instanceof Node,
      "1st argument of `van.hydrate` function must be a DOM Node object"
    ),
    f(
      typeof e == "function",
      "2nd argument of `van.hydrate` function must be a function"
    ),
    r.hydrate(t, $(e))
  ),
  _ = {
    add: he,
    _: ve,
    tags: Q(),
    tagsNS: ye,
    state: pe,
    val: r.val,
    oldVal: r.oldVal,
    derive: ge,
    hydrate: be,
    startCapturingErrors: de,
    stopCapturingErrors: ue,
    get capturedErrors() {
      return T;
    },
  };
function we() {
  const { div: t } = r.tags,
    e = r.state([]);
  return {
    addToast: function (s, o = 60) {
      (e.val = [...e.val, s]),
        setTimeout(() => {
          e.val.shift(), (e.val = [...e.val]);
        }, o * 60);
    },
    render: function () {
      return t(
        { class: "toasts" },
        e.val.map((s) => t({ class: "toast" }, s))
      );
    },
  };
}
const v = we();
class Se {
  constructor() {
    g(this, "user");
    g(this, "userLogged");
    (this.user = {
      name: "Unregistered",
      id: "",
      email: "",
      role: "",
      balance: 0,
    }),
      (this.userLogged = r.state(!1)),
      fetch("/user/AmIloggedIn")
        .then((e) => e.json())
        .then((e) => {
          if (e != null && e.id)
            return (this.user = e), (this.userLogged.val = !0), !0;
        });
  }
  updateBalance(e) {
    this.user.balance = e;
  }
  getBalance() {
    return this.user.balance;
  }
  async register(e, a, n) {
    return fetch("/user/register", {
      method: "post",
      body: JSON.stringify({ email: e, name: a, password: n }),
      headers: { "Content-Type": "application/json" },
    })
      .then((s) => s.json())
      .then((s) => {
        var o;
        if (s.err)
          v.addToast(s.msg ?? "Error !"), console.log("login response", s);
        else {
          if ((o = s.data) != null && o.id)
            return (this.user = s.data), (this.userLogged.val = !0), !0;
          v.addToast(s.msg ?? "Try with login");
        }
        return !1;
      });
  }
  async login(e, a) {
    return fetch("/user/signIn", {
      method: "post",
      body: JSON.stringify({ email: e, password: a }),
      headers: { "Content-Type": "application/json" },
    })
      .then((n) => n.json())
      .then((n) => {
        var s;
        if (n.err) console.log("login response", n);
        else if ((s = n.data) != null && s.id)
          return (this.user = n.data), (this.userLogged.val = !0), !0;
        return !1;
      });
  }
}
console.log("user calisti geldi buralara", new Date().getTime());
const u = new Se();
class _e {
  constructor(e, a) {
    g(this, "roomId", "");
    g(this, "dom");
    g(
      this,
      "gameInfo",
      r.state({
        id: 0,
        name: "will connect",
        createdAt: new Date(),
        active: !1,
        capacity: 0,
        desc: "will be updated when connected",
        gameDuration: 0,
        gameRest: 0,
        image: "",
        priceEnter: 0,
        priceMax: 0,
        priceMin: 0,
      })
    );
    g(
      this,
      "gameState",
      r.state({
        gameState: "Not Started",
        items: [],
        playerBids: [],
        balance: 0,
        name: "",
        remainingTime: 0,
      })
    );
    g(
      this,
      "playerWin",
      r.state({ totalCash: 0, playerCash: 0, newBalance: 0 })
    );
    g(this, "items", r.state([]));
    g(this, "ws");
    g(this, "elems", {});
    g(this, "players", []);
    const n = r.state(0);
    (this.roomId = e),
      (this.dom = a),
      (this.ws = new WebSocket(
        `wss://${location.host}/play?roomid=${e}`,
        "json"
      )),
      (this.ws.onmessage = (s) => {
        let o = JSON.parse(s.data);
        switch ((console.log("ws message", o.type, o), o.type)) {
          default:
            console.log("nodu");
            break;
          case "ping":
            return this.updatePing(o.data);
          case "chat":
            return this.updateChat(o.data);
          case "GameState":
            return this.GameStateUpdate(o.data);
          case "playerWin":
            return this.playerWinUpdate(o.data);
          case "allItems":
            (this.items.val = o.data.map((i) => ({ ...i, price: 0 }))),
              console.log(o.data);
        }
      }),
      (this.ws.onclose = (s) => {
        (this.gameState.val = {
          ...this.gameState.val,
          gameState: "Connection Lost",
        }),
          console.log("ws onclose", s);
      }),
      r.add(a, () => (console.log(n), this.createElement()));
  }
  playerWinUpdate(e) {
    let { totalCash: a, playerCash: n, newBalance: s } = e;
    u.updateBalance(s),
      (this.playerWin.val = { totalCash: a, playerCash: n, newBalance: s }),
      v.addToast(`Total Cash:${a}`),
      v.addToast(`you  ${n} won!`);
  }
  createElement() {
    const { div: e, h3: a, input: n } = r.tags;
    return e({ class: "GameRoom" }, [
      () => (
        console.log("user.user.balance", u.user),
        e({ class: "GameState" }, [
          a(this.gameState.val.gameState),
          e(u.user.balance + " " + this.gameState.val.remainingTime),
        ])
      ),
      () =>
        e(
          { class: "Items relative" },
          this.oneItems(this.items.val),
          this.gameState.val.gameState == "running"
            ? null
            : e(
                { class: " WinningScreen" },
                e({ class: "p2" }, [
                  a(
                    { class: "alert" },
                    "Total cash : " + this.playerWin.val.totalCash
                  ),
                  e({ class: "" }, "You won: " + this.playerWin.val.playerCash),
                  e({ class: "" }, "Your balance: " + u.user.balance),
                  e({ class: "small pt-2" }, "Az sonra oyun baslayacak! "),
                ])
              )
        ),
      ,
      e(
        { class: "chatWidget" },
        e({ class: "chatPlace" }, [
          (this.elems.chat = e({ class: "chat" })),
          n({ onkeydown: (s) => this.onInputChatBox(s) }),
        ])
      ),
      (this.elems.game = e({ class: "gamePlace" }, "")),
    ]);
  }
  oneItems(e) {
    return e
      .sort((a, n) => a.price - n.price)
      .map((a) =>
        this.oneItem(a, 5, 10, async (n) =>
          this.send("placeBid", { item: a.id, amount: n })
        )
      );
  }
  oneItem(e, a, n, s) {
    const { div: o, img: i, a: c } = r.tags;
    let l = n - a,
      d;
    return (
      l / 5 > 5
        ? ((l /= 4),
          (d = [
            c({ onclick: () => s(a) }, a),
            c({ onclick: () => s(a + (l | 0)) }, a + (l | 0)),
            c({ onclick: () => s(a + ((l * 2) | 0)) }, a + ((l * 2) | 0)),
            c({ onclick: () => s(a + ((l * 3) | 0)) }, a + ((l * 3) | 0)),
            c({ onclick: () => s(n) }, n),
          ]))
        : l / 3 > 5
        ? (d = [
            c({ onclick: () => s(a) }, a),
            c({ onclick: () => s(a + ((l / 2) | 0)) }, a + ((l / 2) | 0)),
            c({ onclick: () => s(n) }, n),
          ])
        : l > 1
        ? (d = [c({ onclick: () => s(a) }, a), c({ onclick: () => s(n) }, n)])
        : (d = c({ onclick: () => s(n) }, n)),
      o({ class: "item" }, [
        i({ class: "itemImg", src: e.image }),
        o({ class: "column flex-grom" }, [
          o({ class: "name" }, e.name),
          o({ class: "row align-center" }, [
            o({ class: "price" }, () => e.price),
            o({ class: "bidding" }, d),
          ]),
        ]),
      ])
    );
  }
  onInputChatBox(e) {
    if (e.key == "Enter") {
      let a = e.target;
      this.send("chat", a.value), (a.value = "");
    }
  }
  send(e, a) {
    this.ws.send(JSON.stringify({ type: e, data: a }));
  }
  GameStateUpdate(e) {
    (this.gameState.val = e),
      console.log("GameStateUpdatedata.balance", e.balance),
      u.updateBalance(e.balance),
      e.items &&
        e.items.length &&
        (e.items.forEach((a) => {
          let n = this.items.val.find((s) => s.id == a.itemId);
          n && (n.price = a.cumul);
        }),
        (this.items.val = [...this.items.val]));
  }
  updatePing(e) {
    (this.players = e.players),
      (this.elems.ping.innerHTML = e.time.substring(11, 19));
  }
  updateChat(e) {
    var s;
    let a = this.elems.chat;
    (this.elems.chat.innerHTML += e.map(
      (o) => `<div class="chatLine">
            <div>${o.msg}</div>
            <div>${o.name}</div>
            </div>`
    )),
      a.scrollHeight - a.clientHeight <= a.scrollTop + 70 &&
        (a.scrollTop = a.scrollHeight - a.clientHeight),
      (s = this.elems.chat.querySelector(":last-child")) == null || s.focus();
  }
}
function Le(t, e) {
  return async (n) => {
    var s;
    (e.val = !0),
      n.preventDefault(),
      (await t.register(
        n.target.elements.email.value,
        ((s = n.target.elements.name) == null ? void 0 : s.value) ?? "",
        n.target.elements.password.value
      )) && (e.val = !1),
      console.log("loginRequest", n, t, t.userLogged.val);
  };
}
function ee(t) {
  const { div: e, h2: a, form: n, input: s, label: o } = r.tags;
  let i = (c) => {
    (t.val = !0),
      c.preventDefault(),
      console.log("loginRequest 1"),
      u
        .login(c.target.elements.email.value, c.target.elements.password.value)
        .then((l) => {
          if (!l) return v.addToast("Error / Hata alındı");
          console.log("loginregisterforms userLogin", u.userLogged.val),
            (t.val = !1);
        }),
      console.log("loginRequest 3 end", c, u.userLogged.val);
  };
  return e(
    { class: "row" },
    e({ class: "userLogin column" }, [
      a("Login / Giris"),
      n({ class: "form column", onsubmit: i }, [
        e({ class: "formline" }, s({ name: "email" })),
        e(
          { class: "formLine" },
          s({ type: "password", name: "password", autocomplete: "on" })
        ),
        e({ class: "formline" }, s({ type: "submit" })),
      ]),
    ]),
    e({ class: "userLogin column" }, [
      a("Register/Kayıt"),
      n({ class: "form row", onsubmit: Le(u, t) }, [
        e({ class: "formline" }, [
          o("Name"),
          s({ name: "name", placeholder: "Name" }),
        ]),
        e({ class: "formline" }, [
          o("Email"),
          s({ name: "email", placeholder: "Email" }),
        ]),
        e({ class: "formLine" }, [
          o("Password"),
          s({ type: "password", name: "password", autocomplete: "on" }),
        ]),
        e({ class: "formline" }, s({ type: "submit" })),
      ]),
    ])
  );
}
function Te(t, e, a) {
  console.log(t);
  let { div: n, a: s } = _.tags,
    o = [];
  t.forEach((i) => {
    o.push(
      n(
        { class: "room" },
        n({ class: "column gap" }, [
          n({ class: "count " }, i.count),
          n(
            { class: "name" },
            s(
              {
                class: "",
                onclick: () => {
                  let c = `room-${i.id}`;
                  if (document.querySelector("#" + c))
                    return v.addToast("Zaten odadasiniz");
                  let d = n({ class: "room", id: c });
                  new _e(i.id, d), _.add(a, d);
                },
              },
              i.name
            )
          ),
          n({ class: "desc" }, i.desc),
        ])
      )
    );
  }),
    _.add(e, o);
}
function Ce() {
  const { div: t, h3: e } = _.tags,
    a = _.state(!1);
  let n = t({ class: "rooms" }),
    s = t({ class: "openedRooms row wrap" });
  return (
    console.log("before if", u.userLogged.val),
    u.userLogged.val &&
      fetch("/api/rooms")
        .then((o) => o.json())
        .then((o) => Te(o, n, s)),
    t(
      () => (u.userLogged.val ? t(n, t([e("Rooms "), s])) : ee(a)),
      a.val
        ? t({
            class: "loading",
            innerHTML: `
        <svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg"   x="0px" y="0px"
          viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
         <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
          c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
              <animateTransform 
                 attributeName="transform" 
                 attributeType="XML" 
                 type="rotate"
                 dur="2s" 
                 from="0 50 50"
                 to="360 50 50" 
                 repeatCount="indefinite" />
          </path> 
         <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
          L82,35.7z">
              <animateTransform 
                 attributeName="transform" 
                 attributeType="XML" 
                 type="rotate"
                 dur="2s" 
                 from="0 50 50"
                 to="360 50 50" 
                 repeatCount="indefinite" />
          </path>
        </svg>`,
          })
        : null
    )
  );
}
setTimeout(() => console.log("toast", v.addToast("bir toast geldi")), 2e3);
function Oe() {
  const { div: t, h3: e } = r.tags,
    a = r.state([]);
  let n = [];
  return (
    fetch("/api/rooms")
      .then((s) => s.json())
      .then((s) => {
        (n = s),
          fetch("/api/profile/hourly")
            .then((o) => o.json())
            .then((o) => (a.val = o));
      }),
    t({ class: "row w-full" }, [
      () =>
        t(
          { class: "column  w-full" },
          e("profil sayfasi"),
          a.val.map((s) =>
            t({ class: "row justify-between" }, [
              t(() => {
                var o;
                return (o = n.find((i) => +i.id == s.game)) == null
                  ? void 0
                  : o.name;
              }),
              t(s.amount),
              t(s.createdAt),
            ])
          )
        ),
      t({ class: "column  w-full" }, [e("Balance"), e(u.user.balance)]),
    ])
  );
}
function ke() {
  let t = document.location.pathname.split("/"),
    e = r.state(t[1] || "");
  function a(s) {
    e.val = s;
  }
  function n(s) {
    var i;
    s.preventDefault();
    let o =
      (i = s == null ? void 0 : s.target) == null
        ? void 0
        : i.href.split("/").pop();
    console.log(o), history.pushState("kedi", "", "/" + o), a(o || "");
  }
  return { to: a, url: e, onclick: n };
}
const L = ke();
function Ne() {
  const { div: t, a: e } = r.tags;
  return t({ class: "header" }, [
    t({ class: "logo" }, e({ href: "/" }, "LoserIX")),
    t({}),
    t(
      { class: "menu" },
      e({ href: "/profile", onclick: L.onclick }, "Profile"),
      e({ href: "/winners", onclick: L.onclick }, "Winners"),
      e({ href: "/games", onclick: L.onclick }, "Games"),
      e(
        {
          onclick: () => {
            v.addToast("bi tost");
          },
        },
        "tost ya[alm"
      )
    ),
  ]);
}
function Me() {
  let { div: t } = r.tags,
    e;
  switch ((console.log("main url", L.url.val), L.url.val)) {
    case "profile":
      e = t(() => Oe());
      break;
    case "games":
      e = Ce();
      break;
    default:
      e = t("hi");
  }
  return e;
}
function Pe() {
  const { div: t } = r.tags,
    e = r.state(!1);
  return (
    console.log("before if", u.userLogged.val),
    t(
      { class: "page" },
      t({ class: "content" }, [
        Ne,
        () => (u.userLogged.val ? Me() : ee(e)),
        e.val
          ? t({
              class: "loading",
              innerHTML: `
          <svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg"   x="0px" y="0px"
            viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
           <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
            c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                <animateTransform 
                   attributeName="transform" 
                   attributeType="XML" 
                   type="rotate"
                   dur="2s" 
                   from="0 50 50"
                   to="360 50 50" 
                   repeatCount="indefinite" />
            </path> 
           <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
            L82,35.7z">
                <animateTransform 
                   attributeName="transform" 
                   attributeType="XML" 
                   type="rotate"
                   dur="2s" 
                   from="0 50 50"
                   to="360 50 50" 
                   repeatCount="indefinite" />
            </path>
          </svg>`,
            })
          : null,
        () => v.render(),
      ])
    )
  );
}
r.add(document.body, Pe);
