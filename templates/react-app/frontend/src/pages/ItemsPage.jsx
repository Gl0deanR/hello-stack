import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { api } from "../services/api";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await api.get("/api/v1/items");
      setItems(data);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const { data } = await api.post("/api/v1/items", { title, description });
      setItems((prev) => [data, ...prev]);
      setTitle("");
      setDescription("");
      toast.success("Item created");
    } catch {
      toast.error("Failed to create item");
    }
  }

  async function onDelete(id) {
    try {
      await api.delete(`/api/v1/items/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Failed to delete item");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Items</h1>

      <form
        onSubmit={onCreate}
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
      >
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Add item
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-400">No items yet. Create your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                {item.description && (
                  <div className="text-sm text-slate-500">{item.description}</div>
                )}
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="text-slate-400 hover:text-red-600"
                aria-label="Delete item"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
