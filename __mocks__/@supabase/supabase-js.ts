/**
 * Bullet-proof Supabase mock.
 *  – supports unlimited  .select().eq().eq()…  chains
 *  – supports .range() and .single()
 *  – supports .insert().select().single() and .delete().eq()
 *  – easy to force an error in a test with   mockFail("db-boom")
 */

/*  █████  BULLET-PROOF SUPABASE MOCK  █████  */

type OK<T> = { data: T; error: null;  count?: number };
type KO   = { data: null; error: { message: string } };
type QRes<T = any> = Promise<OK<T> | KO>;

// Initialize memory with all required tables
const mem: Record<string, any[]> = { 
  reviews: [], 
  wishlist_items: [], 
  products: [
    { id: "p1", name: "Test Product" },
    { id: "p2", name: "Another Product" }
  ],
  users: [
    { id: "123e4567-e89b-12d3-a456-426614174000", email: "test@example.com" }
  ]
};

let nextError: string | null = null;

export function mockFail(msg = "mock-error") { nextError = msg; }

function wrap<T>(data: T): OK<T> | KO {
  if (nextError) {
    const e = nextError; nextError = null;
    return { data: null, error: { message: e } };
  }
  return { data, error: null, count: Array.isArray(data) ? data.length : 1 };
}

function chain(table: string) {
  if (!mem[table]) mem[table] = [];
  const c: any = {
    _filters: [],
    select() { return this; },
    eq(field: string, value: any) {
      this._filters.push([field, value]);
      return this;
    },
    order() { return this; },
    range() { return this; },
    insert(v: any) {
      if (nextError) {
        const e = nextError; nextError = null;
        return { select: () => ({ single: () => Promise.resolve({ data: null, error: { message: e } }) }) };
      }
      const items = Array.isArray(v) ? v : [v];
      for (const item of items) {
        if (table === 'cart_items' && mem.products) {
          const prod = mem.products.find((p: any) => p.id === item.product_id);
          if (prod) item.products = prod;
        }
        mem[table].push(item);
      }
      return { select: () => ({ single: () => Promise.resolve(wrap(mem[table][mem[table].length - 1])) }) };
    },
    update(v: any) {
      let items = mem[table];
      for (const [field, value] of this._filters) {
        items = items.filter((row: any) => row[field] === value);
      }
      if (items[0]) {
        Object.assign(items[0], v);
        if (table === 'cart_items' && mem.products) {
          const prod = mem.products.find((p: any) => p.id === items[0].product_id);
          if (prod) items[0].products = prod;
        }
      }
      return this;
    },
    delete() {
      let items = mem[table];
      for (const [field, value] of this._filters) {
        items = items.filter((row: any) => row[field] === value);
      }
      mem[table] = mem[table].filter((row: any) => !items.includes(row));
      return this;
    },
    then(resolve: any) {
      let items = mem[table];
      for (const [field, value] of this._filters) {
        items = items.filter((row: any) => row[field] === value);
      }
      return Promise.resolve(wrap(items)).then(resolve);
    },
    single() {
      let items = mem[table];
      for (const [field, value] of this._filters) {
        items = items.filter((row: any) => row[field] === value);
      }
      return Promise.resolve(wrap(items[0] ?? null));
    },
  };
  return c;
}

export const createClient = jest.fn(() => ({
  from: (t: string) => chain(t)
}));

export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null }))
          })),
          range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null }))
        })),
        range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null, count: 1 })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null, count: 1 }))
  }))
};

export function __getMem() { return mem; } 